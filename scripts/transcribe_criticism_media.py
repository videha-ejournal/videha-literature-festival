#!/usr/bin/env python3
"""Create resumable machine ASR drafts for canonical Videha Discussion & Criticism media.

Canonical ``asr-shard-NNN.json`` assets are written only when an entire shard is covered.
Durable ``asr-checkpoint-NNN.json`` and ``asr-record-<id>.json`` assets are recovery state,
never canonical corpus shards. Long recordings are transcribed in small audio chunks so a
hosted-runner interruption loses at most one chunk rather than one full recording.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import signal
import subprocess
import sys
import tempfile
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

VALID_COVERAGE_STATUSES = {"asr-draft", "no-speech-detected"}
DEFAULT_CHUNK_SECONDS = 300


class TerminationRequested(RuntimeError):
    def __init__(self, signum: int):
        super().__init__(f"termination signal {signum}")
        self.signum = signum


def run(cmd: list[str], timeout: int | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, text=True, capture_output=True, timeout=timeout)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def stable_id(part: int, logical_source: str) -> str:
    return f"p{part:02d}-{hashlib.sha1(f'{part}|{logical_source}'.encode('utf-8')).hexdigest()[:14]}"


def flatten(inventory: dict) -> list[dict]:
    rows: list[dict] = []
    for collection in inventory.get("collections", []):
        part = int(collection["part"])
        identifier = collection["identifier"]
        for item in collection.get("canonicalMedia", []):
            rows.append({
                "part": part,
                "identifier": identifier,
                "collectionTitle": collection.get("title", ""),
                **item,
            })
    return sorted(rows, key=lambda row: (row["part"], str(row["logicalSource"]).lower()))


def source_bytes(row: dict) -> int:
    try:
        return max(0, int(row.get("selectedBytes") or 0))
    except (TypeError, ValueError):
        return 0


def source_sha256(row: dict) -> str | None:
    for key in ("selectedSha256", "sha256", "sourceSha256"):
        value = str(row.get(key) or "").strip().lower()
        if len(value) == 64 and all(c in "0123456789abcdef" for c in value):
            return value
    return None


def package_version(name: str) -> str | None:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        return None


def command_version(command: list[str]) -> str | None:
    try:
        result = run(command, timeout=20)
    except Exception:
        return None
    text = (result.stdout or result.stderr or "").strip().splitlines()
    return text[0] if text else None


def runtime_provenance(model_name: str, runtime_image: str = "") -> dict:
    return {
        "runtimeImage": runtime_image or os.environ.get("ASR_RUNTIME_IMAGE", ""),
        "python": platform.python_version(),
        "platform": platform.platform(),
        "asrModel": model_name,
        "fasterWhisper": package_version("faster-whisper"),
        "ctranslate2": package_version("ctranslate2"),
        "onnxruntime": package_version("onnxruntime"),
        "av": package_version("av"),
        "tokenizers": package_version("tokenizers"),
        "huggingfaceHub": package_version("huggingface-hub"),
        "numpy": package_version("numpy"),
        "ffmpeg": command_version(["ffmpeg", "-version"]),
        "gh": command_version(["gh", "--version"]),
    }


def covered_record(record: dict) -> bool:
    return (
        record.get("status") in VALID_COVERAGE_STATUSES
        and record.get("humanVerified") is False
        and record.get("editorialReview") == "not-reviewed"
        and bool(record.get("id"))
    )


def compatible_resume(data: dict, *, shard_index: int, shard_count: int, canonical_count: int, model_name: str) -> bool:
    return (
        int(data.get("shardIndex", -1)) == shard_index
        and int(data.get("shardCount", -1)) == shard_count
        and int(data.get("canonicalRecordingCount", -1)) == canonical_count
        and str(data.get("asrModel") or "") == model_name
    )


def partial_progress(partial: dict) -> tuple[int, float, str]:
    chunks = partial.get("chunks", []) if isinstance(partial, dict) else []
    return (
        len({int(c.get("chunkIndex", -1)) for c in chunks if int(c.get("chunkIndex", -1)) >= 0}),
        float(partial.get("durationSeconds") or 0.0),
        str(partial.get("updated") or ""),
    )


def load_resume_state(
    paths: list[str],
    *,
    shard_index: int,
    shard_count: int,
    canonical_count: int,
    model_name: str,
    expected_ids: set[str],
) -> tuple[dict[str, dict], dict[str, dict], dict]:
    """Merge compatible canonical/checkpoint/record state without trusting incomplete coverage."""
    resumed: dict[str, dict] = {}
    partials: dict[str, dict] = {}
    meta = {"generation": 0, "digest": "", "runHistory": [], "lastEvent": "", "lastEventAt": ""}
    for raw in paths:
        path = Path(raw)
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"Ignoring unreadable resume file {path}: {type(exc).__name__}: {exc}", flush=True)
            continue
        if not compatible_resume(
            data,
            shard_index=shard_index,
            shard_count=shard_count,
            canonical_count=canonical_count,
            model_name=model_name,
        ):
            print(f"Ignoring incompatible resume file {path}", flush=True)
            continue
        file_generation = int(data.get("checkpointGeneration") or 0)
        file_digest = str(data.get("checkpointDigestSha256") or "")
        if file_generation > int(meta.get("generation") or 0) or (file_generation == int(meta.get("generation") or 0) and file_digest):
            meta["generation"] = file_generation
            meta["digest"] = file_digest
            meta["lastEvent"] = str(data.get("lastEvent") or data.get("checkpointCause") or "")
            meta["lastEventAt"] = str(data.get("lastEventAt") or data.get("generated") or "")
        for run_id in data.get("recoveryRunHistory", []):
            run_id = str(run_id or "")
            if run_id and run_id not in meta["runHistory"]:
                meta["runHistory"].append(run_id)
        direct_run_id = str(data.get("workflowRunId") or "")
        if direct_run_id and direct_run_id not in meta["runHistory"]:
            meta["runHistory"].append(direct_run_id)
        accepted = 0
        for record in data.get("records", []):
            item_id = str(record.get("id") or "")
            if item_id in expected_ids and covered_record(record):
                resumed[item_id] = record
                partials.pop(item_id, None)
                accepted += 1
        partial_accepted = 0
        for partial in data.get("partialRecordings", []):
            item_id = str(partial.get("id") or "")
            if not item_id or item_id not in expected_ids or item_id in resumed:
                continue
            existing = partials.get(item_id)
            if existing is None or partial_progress(partial) > partial_progress(existing):
                partials[item_id] = partial
                partial_accepted += 1
        print(
            f"Resume {path}: accepted {accepted} covered records; "
            f"{partial_accepted} partial recording states; generation {file_generation}",
            flush=True,
        )
    return resumed, partials, meta


def probe_duration(url: str, attempts: int = 4) -> tuple[float, str]:
    last_error = "ffprobe did not return a positive duration"
    for attempt in range(1, attempts + 1):
        result = run([
            "ffprobe", "-v", "error", "-rw_timeout", "120000000",
            "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", url,
        ])
        if result.returncode == 0:
            try:
                duration = float((result.stdout or "").strip())
            except ValueError:
                duration = 0.0
            if duration > 0:
                return duration, ""
        last_error = (result.stderr or result.stdout or last_error)[-4000:]
        if attempt < attempts:
            delay = min(15, 2 ** attempt)
            print(f"  duration probe attempt {attempt}/{attempts} failed; retrying in {delay}s", flush=True)
            time.sleep(delay)
    return 0.0, last_error


def extract_audio_chunk(url: str, destination: Path, start: float, duration: float, attempts: int = 4) -> tuple[bool, str]:
    """Decode one small PCM chunk; bounded chunks make ASR interruption recoverable."""
    last_error = "ffmpeg did not produce usable chunk audio"
    for attempt in range(1, attempts + 1):
        destination.unlink(missing_ok=True)
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-rw_timeout", "120000000",
        ]
        if start > 0:
            cmd += ["-ss", f"{start:.3f}"]
        cmd += [
            "-i", url, "-t", f"{duration:.3f}", "-map", "0:a:0?", "-vn",
            "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(destination),
        ]
        result = run(cmd)
        if result.returncode == 0 and destination.exists() and destination.stat().st_size >= 4096:
            return True, ""
        last_error = (result.stderr or last_error)[-4000:]
        if attempt < attempts:
            delay = min(15, 2 ** attempt)
            print(f"  chunk extraction attempt {attempt}/{attempts} failed; retrying in {delay}s", flush=True)
            time.sleep(delay)
    destination.unlink(missing_ok=True)
    return False, last_error


def transcribe_chunk(model, wav: Path, *, chunk_index: int, start: float, end: float) -> dict:
    segments, info = model.transcribe(
        str(wav),
        language=None,
        beam_size=1,
        temperature=0.0,
        vad_filter=True,
        condition_on_previous_text=False,
        initial_prompt="ई मैथिली भाषाक साहित्य, समालोचना, कविता, कथा, नाटक आ विचार-विमर्शक रेकॉर्डिंग अछि।",
    )
    rendered: list[dict] = []
    chunks: list[str] = []
    for segment in segments:
        text = (segment.text or "").strip()
        if not text:
            continue
        seg_start = min(end, start + max(0.0, float(segment.start)))
        seg_end = min(end, start + max(0.0, float(segment.end)))
        rendered.append({"start": round(seg_start, 3), "end": round(seg_end, 3), "text": text})
        chunks.append(text)
    text = " ".join(chunks).strip()
    return {
        "chunkIndex": chunk_index,
        "startSeconds": round(start, 3),
        "endSeconds": round(end, 3),
        "status": "asr-draft" if text else "no-speech-detected",
        "detectedLanguage": getattr(info, "language", None),
        "languageProbability": round(float(getattr(info, "language_probability", 0.0) or 0.0), 6),
        "decodedAudioSha256": sha256_file(wav),
        "plainText": text,
        "segments": rendered,
        "generated": now_iso(),
    }


def new_partial(row: dict, *, duration: float, chunk_seconds: int, model_name: str) -> dict:
    return {
        "id": stable_id(int(row["part"]), str(row["logicalSource"])),
        "part": int(row["part"]),
        "collectionIdentifier": row["identifier"],
        "collectionTitle": row.get("collectionTitle", ""),
        "logicalSource": row["logicalSource"],
        "mediaName": row["selectedName"],
        "mediaUrl": row["selectedUrl"],
        "mediaFormat": row.get("selectedFormat", ""),
        "sourceMediaBytes": source_bytes(row),
        "sourceMediaSha256": source_sha256(row),
        "durationSeconds": round(duration, 3),
        "chunkSeconds": chunk_seconds,
        "expectedChunkCount": max(1, int(math.ceil(duration / chunk_seconds))),
        "asrModel": model_name,
        "chunks": [],
        "updated": now_iso(),
    }


def build_record_from_partial(row: dict, partial: dict, model_name: str, runtime: dict) -> dict:
    chunks = sorted(partial.get("chunks", []), key=lambda c: int(c.get("chunkIndex", -1)))
    expected = int(partial.get("expectedChunkCount") or 0)
    chunk_ids = [int(c.get("chunkIndex", -1)) for c in chunks]
    if expected <= 0 or chunk_ids != list(range(expected)):
        raise ValueError(f"partial recording is not chunk-complete: expected {expected}, got {chunk_ids}")
    rendered: list[dict] = []
    text_parts: list[str] = []
    language_weight: dict[str, float] = defaultdict(float)
    probability_weight: dict[str, float] = defaultdict(float)
    fingerprint_material: list[str] = []
    chunk_evidence: list[dict] = []
    for chunk in chunks:
        rendered.extend(chunk.get("segments", []))
        text = str(chunk.get("plainText") or "").strip()
        if text:
            text_parts.append(text)
        lang = str(chunk.get("detectedLanguage") or "")
        chunk_duration = max(0.001, float(chunk.get("endSeconds") or 0) - float(chunk.get("startSeconds") or 0))
        prob = float(chunk.get("languageProbability") or 0.0)
        if lang:
            language_weight[lang] += chunk_duration
            probability_weight[lang] += chunk_duration * prob
        digest = str(chunk.get("decodedAudioSha256") or "")
        fingerprint_material.append(digest)
        chunk_evidence.append({
            "chunkIndex": int(chunk["chunkIndex"]),
            "startSeconds": chunk["startSeconds"],
            "endSeconds": chunk["endSeconds"],
            "status": chunk["status"],
            "detectedLanguage": chunk.get("detectedLanguage"),
            "languageProbability": chunk.get("languageProbability", 0.0),
            "decodedAudioSha256": digest,
        })
    detected = max(language_weight, key=language_weight.get) if language_weight else None
    probability = (
        probability_weight[detected] / language_weight[detected]
        if detected and language_weight.get(detected)
        else 0.0
    )
    plain = " ".join(text_parts).strip()
    status = "asr-draft" if plain else "no-speech-detected"
    return {
        "id": stable_id(int(row["part"]), str(row["logicalSource"])),
        "part": int(row["part"]),
        "collectionIdentifier": row["identifier"],
        "collectionTitle": row.get("collectionTitle", ""),
        "logicalSource": row["logicalSource"],
        "mediaName": row["selectedName"],
        "mediaUrl": row["selectedUrl"],
        "mediaFormat": row.get("selectedFormat", ""),
        "mediaVariants": row.get("mediaVariants", 1),
        "sourceMediaBytes": source_bytes(row),
        "sourceMediaSha256": source_sha256(row),
        "decodedAudioFingerprintSha256": sha256_bytes("\n".join(fingerprint_material).encode("ascii")),
        "status": status,
        "provenance": "faster-whisper ASR from Internet Archive media; chunk-resumable decoded PCM evidence",
        "asrModel": model_name,
        "detectedLanguage": detected,
        "languageProbability": round(probability, 6),
        "durationSeconds": round(float(partial.get("durationSeconds") or 0.0), 3),
        "plainText": plain,
        "segments": sorted(rendered, key=lambda s: (float(s.get("start") or 0), float(s.get("end") or 0))),
        "chunkEvidence": chunk_evidence,
        "asrRuntime": {
            "runtimeImage": runtime.get("runtimeImage", ""),
            "python": runtime.get("python"),
            "fasterWhisper": runtime.get("fasterWhisper"),
            "ctranslate2": runtime.get("ctranslate2"),
            "onnxruntime": runtime.get("onnxruntime"),
        },
        "humanVerified": False,
        "editorialReview": "not-reviewed",
        "reviewRequired": True,
        "generated": now_iso(),
    }


def build_result(
    *,
    inventory: dict,
    model_name: str,
    shard_index: int,
    shard_count: int,
    canonical_count: int,
    selected_count: int,
    records: list[dict],
    failures: list[dict],
    checkpoint: bool,
    runtime: dict | None = None,
) -> dict:
    draft_count = sum(record.get("status") == "asr-draft" for record in records)
    no_speech_count = sum(record.get("status") == "no-speech-detected" for record in records)
    covered_count = draft_count + no_speech_count
    return {
        "schemaVersion": 4,
        "generated": now_iso(),
        "inventoryGenerated": inventory.get("generated"),
        "asrModel": model_name,
        "shardIndex": shard_index,
        "shardCount": shard_count,
        "canonicalRecordingCount": canonical_count,
        "selectedCount": selected_count,
        "draftCount": draft_count,
        "noSpeechCount": no_speech_count,
        "coveredCount": covered_count,
        "failureCount": len(failures),
        "checkpoint": checkpoint,
        "completeShard": (
            not checkpoint
            and not failures
            and len(records) == selected_count
            and covered_count == selected_count
        ),
        "runtimeProvenance": runtime or {},
        "records": records,
    }


def write_json_atomic(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def checkpoint_digest(payload: dict) -> str:
    copy = dict(payload)
    copy.pop("checkpointDigestSha256", None)
    raw = json.dumps(copy, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(raw)


def remote_checkpoint_generation(release: str, repo: str, asset_name: str) -> tuple[int, str]:
    if not release or not repo:
        return -1, ""
    with tempfile.TemporaryDirectory(prefix="videha-checkpoint-remote-") as tmp:
        result = run([
            "gh", "release", "download", release, "--repo", repo,
            "--pattern", asset_name, "--dir", tmp,
        ])
        path = Path(tmp) / asset_name
        if result.returncode != 0 or not path.exists():
            return -1, ""
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return int(data.get("checkpointGeneration") or 0), str(data.get("checkpointDigestSha256") or "")
        except Exception:
            return -1, ""


def upload_checkpoint(path: Path, release: str, repo: str, attempts: int = 4) -> bool:
    """Upload checkpoint only if it is not older than the durable remote generation."""
    if not release or not repo:
        return True
    local = json.loads(path.read_text(encoding="utf-8"))
    local_generation = int(local.get("checkpointGeneration") or 0)
    local_digest = str(local.get("checkpointDigestSha256") or "")
    remote_generation, remote_digest = remote_checkpoint_generation(release, repo, path.name)
    if remote_generation > local_generation:
        print(
            f"WARNING: refusing checkpoint regression for {path.name}: "
            f"remote generation {remote_generation} > local {local_generation}",
            flush=True,
        )
        return False
    if remote_generation == local_generation and remote_digest and remote_digest != local_digest:
        print(
            f"WARNING: refusing same-generation checkpoint divergence for {path.name}",
            flush=True,
        )
        return False
    last_error = ""
    for attempt in range(1, attempts + 1):
        result = run(["gh", "release", "upload", release, str(path), "--clobber", "--repo", repo])
        if result.returncode == 0:
            print(f"  checkpoint persisted: {path.name} generation {local_generation}", flush=True)
            return True
        last_error = (result.stderr or result.stdout or "")[-2000:]
        if attempt < attempts:
            delay = min(15, 2 ** attempt)
            print(f"  checkpoint upload attempt {attempt}/{attempts} failed; retrying in {delay}s", flush=True)
            time.sleep(delay)
    print(f"WARNING: checkpoint upload failed after {attempts} attempts: {last_error}", flush=True)
    return False


def persist_checkpoint(
    path: Path | None,
    *,
    inventory: dict,
    model_name: str,
    shard_index: int,
    shard_count: int,
    canonical_count: int,
    selected_count: int,
    records_by_id: dict[str, dict],
    partials_by_id: dict[str, dict],
    release: str,
    repo: str,
    runtime: dict,
    meta: dict,
    scope: str,
    cause: str,
) -> None:
    if path is None:
        return
    records = sorted(
        (record for record in records_by_id.values() if covered_record(record)),
        key=lambda r: (int(r.get("part") or 0), str(r.get("logicalSource") or "").lower()),
    )
    partials = sorted(
        (partial for item_id, partial in partials_by_id.items() if item_id not in records_by_id),
        key=lambda p: (int(p.get("part") or 0), str(p.get("logicalSource") or "").lower()),
    )
    generation = int(meta.get("generation") or 0) + 1
    run_history = list(meta.get("runHistory") or [])
    current_run = str(os.environ.get("GITHUB_RUN_ID") or "")
    if current_run and current_run not in run_history:
        run_history.append(current_run)
    run_history = run_history[-100:]
    payload = build_result(
        inventory=inventory,
        model_name=model_name,
        shard_index=shard_index,
        shard_count=shard_count,
        canonical_count=canonical_count,
        selected_count=selected_count,
        records=records,
        failures=[],
        checkpoint=True,
        runtime=runtime,
    )
    payload.update({
        "checkpointScope": scope,
        "checkpointGeneration": generation,
        "previousCheckpointSha256": str(meta.get("digest") or ""),
        "checkpointCause": cause,
        "lastEvent": cause,
        "lastEventAt": now_iso(),
        "workflowRunId": current_run or None,
        "workflowRunAttempt": int(os.environ.get("GITHUB_RUN_ATTEMPT") or 0),
        "workflowJob": os.environ.get("GITHUB_JOB"),
        "recoveryRunHistory": run_history,
        "partialRecordingCount": len(partials),
        "partialRecordings": partials,
    })
    payload["checkpointDigestSha256"] = checkpoint_digest(payload)
    write_json_atomic(path, payload)
    if upload_checkpoint(path, release, repo):
        meta["generation"] = generation
        meta["digest"] = payload["checkpointDigestSha256"]
        meta["runHistory"] = run_history
        meta["lastEvent"] = cause
        meta["lastEventAt"] = payload["lastEventAt"]


def rows_for_shard(all_rows: list[dict], shard_index: int, shard_count: int) -> list[dict]:
    return [row for index, row in enumerate(all_rows) if index % shard_count == shard_index]


def failure_record(row: dict, item_id: str, status: str, error: str) -> dict:
    return {
        "id": item_id,
        "part": int(row["part"]),
        "logicalSource": row["logicalSource"],
        "mediaUrl": row["selectedUrl"],
        "sourceMediaBytes": source_bytes(row),
        "status": status,
        "error": error,
        "humanVerified": False,
        "editorialReview": "not-reviewed",
    }


def install_signal_handlers(flusher: Callable[[str], None]) -> dict[int, object]:
    previous: dict[int, object] = {}

    def handler(signum, _frame):
        print(f"Received termination signal {signum}; flushing durable recovery state", flush=True)
        try:
            flusher(f"signal-{signum}")
        except Exception as exc:
            print(f"WARNING: emergency checkpoint flush failed: {type(exc).__name__}: {exc}", flush=True)
        raise TerminationRequested(signum)

    for sig in (signal.SIGTERM, signal.SIGINT):
        previous[sig] = signal.getsignal(sig)
        signal.signal(sig, handler)
    return previous


def restore_signal_handlers(previous: dict[int, object]) -> None:
    for sig, handler in previous.items():
        signal.signal(sig, handler)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", default="public/data/criticism-transcript-inventory.json")
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, required=True)
    parser.add_argument("--out", default="")
    parser.add_argument("--model", default=os.environ.get("VIDEHA_ASR_MODEL", "base"))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--resume", action="append", default=[], help="Compatible canonical/checkpoint/record state; repeatable")
    parser.add_argument("--checkpoint", default="", help="Durable non-canonical recovery JSON path")
    parser.add_argument("--checkpoint-release", default="", help="Optional GitHub release tag for durable checkpoint uploads")
    parser.add_argument("--checkpoint-repo", default="", help="Optional GitHub repository owner/name for durable checkpoint uploads")
    parser.add_argument("--checkpoint-scope", choices=("shard", "record"), default="shard")
    parser.add_argument("--only-id", default="", help="Process only one stable recording id within the shard")
    parser.add_argument("--defer-bytes-above", type=int, default=0, help="Leave large recordings for the dedicated long-recording lane")
    parser.add_argument("--allow-incomplete", action="store_true", help="Return success after eligible work even if deferred coverage remains")
    parser.add_argument("--assemble-only", action="store_true", help="Never run ASR; assemble a canonical shard from resume state only")
    parser.add_argument("--chunk-seconds", type=int, default=int(os.environ.get("ASR_CHUNK_SECONDS", DEFAULT_CHUNK_SECONDS)))
    parser.add_argument("--runtime-image", default=os.environ.get("ASR_RUNTIME_IMAGE", ""))
    args = parser.parse_args()

    if args.chunk_seconds < 60:
        raise SystemExit("--chunk-seconds must be at least 60")

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    all_rows = flatten(inventory)
    selected_full = rows_for_shard(all_rows, args.shard_index, args.shard_count)
    if args.limit:
        selected_full = selected_full[:args.limit]
    expected_ids = {stable_id(int(row["part"]), str(row["logicalSource"])) for row in selected_full}
    row_by_id = {stable_id(int(row["part"]), str(row["logicalSource"])): row for row in selected_full}
    if args.only_id and args.only_id not in expected_ids:
        raise SystemExit(f"--only-id {args.only_id} is not part of shard {args.shard_index}")
    out = Path(args.out) if args.out else None
    checkpoint_path = Path(args.checkpoint) if args.checkpoint else None
    print(
        f"Canonical recordings: {len(all_rows)}; shard {args.shard_index}/{args.shard_count}: "
        f"{len(selected_full)} records",
        flush=True,
    )

    records_by_id, partials_by_id, meta = load_resume_state(
        args.resume,
        shard_index=args.shard_index,
        shard_count=args.shard_count,
        canonical_count=len(all_rows),
        model_name=args.model,
        expected_ids=expected_ids,
    )
    runtime = runtime_provenance(args.model, args.runtime_image)
    if records_by_id:
        print(f"Resuming with {len(records_by_id)}/{len(selected_full)} covered recordings", flush=True)
    if partials_by_id:
        print(f"Resuming {len(partials_by_id)} chunk-level partial recordings", flush=True)

    def flush(cause: str) -> None:
        persist_checkpoint(
            checkpoint_path,
            inventory=inventory,
            model_name=args.model,
            shard_index=args.shard_index,
            shard_count=args.shard_count,
            canonical_count=len(all_rows),
            selected_count=len(selected_full),
            records_by_id=records_by_id,
            partials_by_id=partials_by_id,
            release=args.checkpoint_release,
            repo=args.checkpoint_repo,
            runtime=runtime,
            meta=meta,
            scope=args.checkpoint_scope,
            cause=cause,
        )

    def write_canonical_if_complete() -> bool:
        if len(records_by_id) != len(selected_full):
            return False
        records = [records_by_id[stable_id(int(row["part"]), str(row["logicalSource"]))] for row in selected_full]
        if not all(covered_record(record) for record in records):
            return False
        if out is None:
            return True
        result = build_result(
            inventory=inventory,
            model_name=args.model,
            shard_index=args.shard_index,
            shard_count=args.shard_count,
            canonical_count=len(all_rows),
            selected_count=len(selected_full),
            records=records,
            failures=[],
            checkpoint=False,
            runtime=runtime,
        )
        write_json_atomic(out, result)
        print(f"Canonical shard complete: {len(records)} covered", flush=True)
        return True

    if args.assemble_only:
        if write_canonical_if_complete():
            return 0
        print(
            f"Assembly incomplete: {len(records_by_id)}/{len(selected_full)} covered; canonical shard not written",
            flush=True,
        )
        return 1

    if write_canonical_if_complete():
        return 0

    targets = [row for row in selected_full if stable_id(int(row["part"]), str(row["logicalSource"])) not in records_by_id]
    if args.only_id:
        targets = [row_by_id[args.only_id]] if args.only_id not in records_by_id else []
    elif args.defer_bytes_above:
        deferred = [row for row in targets if source_bytes(row) >= args.defer_bytes_above]
        targets = [row for row in targets if source_bytes(row) < args.defer_bytes_above]
        if deferred:
            print(
                f"Deferring {len(deferred)} large recordings to dedicated lane at >= {args.defer_bytes_above} bytes",
                flush=True,
            )

    if not targets:
        if args.only_id and args.only_id in records_by_id:
            flush("record-already-complete")
            return 0
        flush("no-eligible-work")
        return 0 if args.allow_incomplete else (0 if write_canonical_if_complete() else 1)

    from faster_whisper import WhisperModel

    model = WhisperModel(
        args.model,
        device="cpu",
        compute_type="int8",
        cpu_threads=max(2, os.cpu_count() or 2),
        num_workers=1,
    )
    failures: list[dict] = []
    previous_handlers = install_signal_handlers(flush)
    try:
        with tempfile.TemporaryDirectory(prefix="videha-asr-") as temp:
            work = Path(temp)
            for number, row in enumerate(targets, 1):
                item_id = stable_id(int(row["part"]), str(row["logicalSource"]))
                if item_id in records_by_id:
                    continue
                print(f"[{number}/{len(targets)}] Part {row['part']} · {row['logicalSource']}", flush=True)
                partial = partials_by_id.get(item_id)
                duration = float(partial.get("durationSeconds") or 0.0) if partial else 0.0
                if duration <= 0:
                    duration, error = probe_duration(row["selectedUrl"])
                    if duration <= 0:
                        failures.append(failure_record(row, item_id, "duration-probe-failed", error))
                        flush("duration-probe-failed")
                        continue
                expected_chunk_count = max(1, int(math.ceil(duration / args.chunk_seconds)))
                if partial is None or int(partial.get("chunkSeconds") or 0) != args.chunk_seconds:
                    partial = new_partial(row, duration=duration, chunk_seconds=args.chunk_seconds, model_name=args.model)
                    partials_by_id[item_id] = partial
                else:
                    partial["expectedChunkCount"] = expected_chunk_count
                    partial["durationSeconds"] = round(duration, 3)
                existing_chunks = {
                    int(chunk.get("chunkIndex", -1)): chunk
                    for chunk in partial.get("chunks", [])
                    if int(chunk.get("chunkIndex", -1)) >= 0
                }
                for chunk_index in range(expected_chunk_count):
                    if chunk_index in existing_chunks:
                        print(
                            f"  chunk {chunk_index + 1}/{expected_chunk_count} resume",
                            flush=True,
                        )
                        continue
                    start = chunk_index * args.chunk_seconds
                    end = min(duration, start + args.chunk_seconds)
                    wav = work / f"{item_id}-{chunk_index:04d}.wav"
                    print(
                        f"  chunk {chunk_index + 1}/{expected_chunk_count} · {start:.0f}-{end:.0f}s",
                        flush=True,
                    )
                    ok, error = extract_audio_chunk(row["selectedUrl"], wav, start, max(1.0, end - start))
                    if not ok:
                        failures.append(failure_record(row, item_id, "audio-extraction-failed", error))
                        wav.unlink(missing_ok=True)
                        flush("audio-extraction-failed")
                        break
                    try:
                        chunk = transcribe_chunk(model, wav, chunk_index=chunk_index, start=start, end=end)
                        existing_chunks[chunk_index] = chunk
                        partial["chunks"] = [existing_chunks[i] for i in sorted(existing_chunks)]
                        partial["updated"] = now_iso()
                        flush(f"chunk-{chunk_index}-complete")
                        print(
                            f"    -> {chunk['status']} · {len(chunk.get('plainText', ''))} chars · checkpointed",
                            flush=True,
                        )
                    except TerminationRequested:
                        raise
                    except Exception as exc:
                        failures.append(
                            failure_record(row, item_id, "asr-failed", f"{type(exc).__name__}: {exc}")
                        )
                        flush("asr-failed")
                        break
                    finally:
                        wav.unlink(missing_ok=True)
                chunk_ids = sorted(existing_chunks)
                if chunk_ids == list(range(expected_chunk_count)):
                    partial["chunks"] = [existing_chunks[i] for i in chunk_ids]
                    try:
                        record = build_record_from_partial(row, partial, args.model, runtime)
                    except Exception as exc:
                        failures.append(
                            failure_record(row, item_id, "record-finalization-failed", f"{type(exc).__name__}: {exc}")
                        )
                        flush("record-finalization-failed")
                        continue
                    records_by_id[item_id] = record
                    partials_by_id.pop(item_id, None)
                    flush("record-complete")
                    print(
                        f"  -> recording complete: {record['status']} · {len(record.get('plainText',''))} chars",
                        flush=True,
                    )
    except TerminationRequested as exc:
        print(f"Graceful termination after checkpoint flush; signal {exc.signum}", flush=True)
        return 128 + int(exc.signum)
    finally:
        restore_signal_handlers(previous_handlers)

    if write_canonical_if_complete():
        return 0 if not failures else 1

    if args.allow_incomplete and not failures:
        flush("eligible-work-complete")
        print(
            f"Eligible recovery work complete; canonical coverage remains {len(records_by_id)}/{len(selected_full)}",
            flush=True,
        )
        return 0

    if args.only_id and args.only_id in records_by_id and not failures:
        flush("record-lane-complete")
        return 0

    print(
        f"Incomplete: covered {len(records_by_id)}/{len(selected_full)}; failures {len(failures)}; canonical shard not written",
        flush=True,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
