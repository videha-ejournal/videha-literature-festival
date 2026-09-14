#!/usr/bin/env python3
"""Create machine transcript drafts for canonical Videha Discussion & Criticism recordings.

This program never marks output as human verified. It extracts a 16 kHz mono audio stream
from the Internet Archive source and transcribes it with faster-whisper. Output is JSON so
provenance, timestamps, detected language and review state remain inspectable.

Released checkpoint assets are deliberately separate from canonical ``asr-shard-*.json``
assets. A checkpoint contains only records with valid machine-coverage statuses and may be
used to resume work after a hosted-runner shutdown.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

VALID_COVERAGE_STATUSES = {"asr-draft", "no-speech-detected"}


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, text=True, capture_output=True)


def stable_id(part: int, logical_source: str) -> str:
    return f"p{part:02d}-{hashlib.sha1(f'{part}|{logical_source}'.encode('utf-8')).hexdigest()[:14]}"


def flatten(inventory: dict) -> list[dict]:
    rows = []
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
    return sorted(rows, key=lambda row: (row["part"], row["logicalSource"].lower()))


def extract_audio(url: str, destination: Path, attempts: int = 4) -> tuple[bool, str]:
    """Extract audio, retrying transient remote 5XX/network failures without reclassifying them."""
    last_error = "ffmpeg did not produce usable audio"
    for attempt in range(1, attempts + 1):
        destination.unlink(missing_ok=True)
        result = run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-rw_timeout", "120000000",
            "-i", url, "-map", "0:a:0?", "-vn", "-ac", "1", "-ar", "16000",
            "-c:a", "pcm_s16le", str(destination),
        ])
        if result.returncode == 0 and destination.exists() and destination.stat().st_size >= 4096:
            return True, ""
        last_error = (result.stderr or last_error)[-4000:]
        if attempt < attempts:
            delay = min(15, 2 ** attempt)
            print(f"  audio fetch/extraction attempt {attempt}/{attempts} failed; retrying in {delay}s", flush=True)
            time.sleep(delay)
    destination.unlink(missing_ok=True)
    return False, last_error


def transcribe_one(model, row: dict, wav: Path, model_name: str) -> dict:
    segments, info = model.transcribe(
        str(wav),
        language=None,
        beam_size=1,
        temperature=0.0,
        vad_filter=True,
        condition_on_previous_text=False,
        initial_prompt="ई मैथिली भाषाक साहित्य, समालोचना, कविता, कथा, नाटक आ विचार-विमर्शक रेकॉर्डिंग अछि।",
    )
    rendered = []
    chunks = []
    for segment in segments:
        text = (segment.text or "").strip()
        if not text:
            continue
        rendered.append({"start": round(float(segment.start), 3), "end": round(float(segment.end), 3), "text": text})
        chunks.append(text)
    text = " ".join(chunks).strip()
    status = "asr-draft" if text else "no-speech-detected"
    return {
        "id": stable_id(row["part"], row["logicalSource"]),
        "part": row["part"],
        "collectionIdentifier": row["identifier"],
        "collectionTitle": row.get("collectionTitle", ""),
        "logicalSource": row["logicalSource"],
        "mediaName": row["selectedName"],
        "mediaUrl": row["selectedUrl"],
        "mediaFormat": row.get("selectedFormat", ""),
        "mediaVariants": row.get("mediaVariants", 1),
        "status": status,
        "provenance": "faster-whisper ASR from Internet Archive media",
        "asrModel": model_name,
        "detectedLanguage": getattr(info, "language", None),
        "languageProbability": round(float(getattr(info, "language_probability", 0.0) or 0.0), 6),
        "durationSeconds": round(float(getattr(info, "duration", 0.0) or 0.0), 3),
        "plainText": text,
        "segments": rendered,
        "humanVerified": False,
        "editorialReview": "not-reviewed",
        "reviewRequired": True,
        "generated": datetime.now(timezone.utc).isoformat(),
    }


def covered_record(record: dict) -> bool:
    """Return True only for provenance-safe machine coverage records."""
    return (
        record.get("status") in VALID_COVERAGE_STATUSES
        and record.get("humanVerified") is False
        and record.get("editorialReview") == "not-reviewed"
        and bool(record.get("id"))
    )


def load_resume_records(
    paths: list[str],
    *,
    shard_index: int,
    shard_count: int,
    canonical_count: int,
    model_name: str,
    expected_ids: set[str],
) -> dict[str, dict]:
    """Load only compatible, covered records from canonical shards/checkpoints."""
    resumed: dict[str, dict] = {}
    for raw in paths:
        path = Path(raw)
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"Ignoring unreadable resume file {path}: {type(exc).__name__}: {exc}", flush=True)
            continue
        compatible = (
            int(data.get("shardIndex", -1)) == shard_index
            and int(data.get("shardCount", -1)) == shard_count
            and int(data.get("canonicalRecordingCount", -1)) == canonical_count
            and str(data.get("asrModel") or "") == model_name
        )
        if not compatible:
            print(f"Ignoring incompatible resume file {path}", flush=True)
            continue
        accepted = 0
        for record in data.get("records", []):
            item_id = str(record.get("id") or "")
            if item_id in expected_ids and covered_record(record):
                resumed[item_id] = record
                accepted += 1
        print(f"Resume {path}: accepted {accepted} covered records", flush=True)
    return resumed


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
) -> dict:
    draft_count = sum(record.get("status") == "asr-draft" for record in records)
    no_speech_count = sum(record.get("status") == "no-speech-detected" for record in records)
    covered_count = draft_count + no_speech_count
    return {
        "schemaVersion": 3,
        "generated": datetime.now(timezone.utc).isoformat(),
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
        "records": records,
    }


def write_json_atomic(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def upload_checkpoint(path: Path, release: str, repo: str, attempts: int = 4) -> bool:
    """Persist a uniquely named checkpoint release asset with bounded retry/backoff."""
    if not release or not repo:
        return True
    last_error = ""
    for attempt in range(1, attempts + 1):
        result = run([
            "gh", "release", "upload", release, str(path),
            "--clobber", "--repo", repo,
        ])
        if result.returncode == 0:
            print(f"  checkpoint persisted: {path.name}", flush=True)
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
    release: str,
    repo: str,
) -> None:
    if path is None:
        return
    records = sorted(
        (record for record in records_by_id.values() if covered_record(record)),
        key=lambda r: (int(r.get("part") or 0), str(r.get("logicalSource") or "").lower()),
    )
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
    )
    write_json_atomic(path, payload)
    upload_checkpoint(path, release, repo)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", default="public/data/criticism-transcript-inventory.json")
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--model", default=os.environ.get("VIDEHA_ASR_MODEL", "base"))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--resume", action="append", default=[], help="Existing canonical shard/checkpoint to resume from; repeatable")
    parser.add_argument("--checkpoint", default="", help="Local checkpoint JSON path; contains only valid covered records")
    parser.add_argument("--checkpoint-release", default="", help="Optional GitHub release tag for durable checkpoint uploads")
    parser.add_argument("--checkpoint-repo", default="", help="Optional GitHub repository owner/name for durable checkpoint uploads")
    args = parser.parse_args()

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    all_rows = flatten(inventory)
    selected = [row for index, row in enumerate(all_rows) if index % args.shard_count == args.shard_index]
    if args.limit:
        selected = selected[:args.limit]
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_path = Path(args.checkpoint) if args.checkpoint else None
    expected_ids = {stable_id(row["part"], row["logicalSource"]) for row in selected}
    print(f"Canonical recordings: {len(all_rows)}; shard {args.shard_index}/{args.shard_count}: {len(selected)}", flush=True)

    records_by_id = load_resume_records(
        args.resume,
        shard_index=args.shard_index,
        shard_count=args.shard_count,
        canonical_count=len(all_rows),
        model_name=args.model,
        expected_ids=expected_ids,
    )
    if records_by_id:
        print(f"Resuming with {len(records_by_id)}/{len(selected)} covered recordings", flush=True)

    failures: list[dict] = []
    pending = [row for row in selected if stable_id(row["part"], row["logicalSource"]) not in records_by_id]

    # A complete persisted canonical shard can be normalized without importing/loading Whisper.
    if not pending and len(records_by_id) == len(selected):
        records = [records_by_id[stable_id(row["part"], row["logicalSource"])] for row in selected]
        result = build_result(
            inventory=inventory,
            model_name=args.model,
            shard_index=args.shard_index,
            shard_count=args.shard_count,
            canonical_count=len(all_rows),
            selected_count=len(selected),
            records=records,
            failures=[],
            checkpoint=False,
        )
        write_json_atomic(out, result)
        print(f"Shard already complete from resume state: {len(records)} covered", flush=True)
        return 0

    from faster_whisper import WhisperModel

    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=max(2, os.cpu_count() or 2), num_workers=1)
    with tempfile.TemporaryDirectory(prefix="videha-asr-") as temp:
        work = Path(temp)
        for number, row in enumerate(selected, 1):
            item_id = stable_id(row["part"], row["logicalSource"])
            if item_id in records_by_id:
                print(f"[{number}/{len(selected)}] resume · Part {row['part']} · {row['logicalSource']}", flush=True)
                continue
            wav = work / f"{item_id}.wav"
            print(f"[{number}/{len(selected)}] Part {row['part']} · {row['logicalSource']}", flush=True)
            ok, error = extract_audio(row["selectedUrl"], wav)
            if not ok:
                failure = {
                    "id": item_id,
                    "part": row["part"],
                    "logicalSource": row["logicalSource"],
                    "mediaUrl": row["selectedUrl"],
                    "status": "audio-extraction-failed",
                    "error": error,
                    "humanVerified": False,
                    "editorialReview": "not-reviewed",
                }
                failures.append(failure)
                wav.unlink(missing_ok=True)
                continue
            try:
                record = transcribe_one(model, row, wav, args.model)
                if record["status"] in VALID_COVERAGE_STATUSES:
                    records_by_id[item_id] = record
                    print(f"  -> {record['status']} · {len(record.get('plainText',''))} chars", flush=True)
                    persist_checkpoint(
                        checkpoint_path,
                        inventory=inventory,
                        model_name=args.model,
                        shard_index=args.shard_index,
                        shard_count=args.shard_count,
                        canonical_count=len(all_rows),
                        selected_count=len(selected),
                        records_by_id=records_by_id,
                        release=args.checkpoint_release,
                        repo=args.checkpoint_repo,
                    )
                else:
                    failures.append(record)
            except Exception as exc:
                failure = {
                    "id": item_id,
                    "part": row["part"],
                    "logicalSource": row["logicalSource"],
                    "mediaUrl": row["selectedUrl"],
                    "status": "asr-failed",
                    "error": f"{type(exc).__name__}: {exc}",
                    "humanVerified": False,
                    "editorialReview": "not-reviewed",
                }
                failures.append(failure)
            finally:
                wav.unlink(missing_ok=True)

    records: list[dict] = []
    for row in selected:
        item_id = stable_id(row["part"], row["logicalSource"])
        if item_id in records_by_id:
            records.append(records_by_id[item_id])
        else:
            match = next((failure for failure in failures if failure.get("id") == item_id), None)
            if match is not None:
                records.append(match)

    result = build_result(
        inventory=inventory,
        model_name=args.model,
        shard_index=args.shard_index,
        shard_count=args.shard_count,
        canonical_count=len(all_rows),
        selected_count=len(selected),
        records=records,
        failures=failures,
        checkpoint=False,
    )
    write_json_atomic(out, result)
    print(
        f"Completed {len(records)}; drafts {result['draftCount']}; "
        f"no-speech {result['noSpeechCount']}; failures {result['failureCount']}"
    )
    return 1 if failures or result["coveredCount"] != len(selected) else 0


if __name__ == "__main__":
    raise SystemExit(main())
