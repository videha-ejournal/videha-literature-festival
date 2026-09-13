#!/usr/bin/env python3
"""Create machine transcript drafts for canonical Videha Discussion & Criticism recordings.

This program never marks output as human verified. It extracts a 16 kHz mono audio stream
from the Internet Archive source and transcribes it with faster-whisper. Output is JSON so
provenance, timestamps, detected language and review state remain inspectable.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path


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


def extract_audio(url: str, destination: Path) -> tuple[bool, str]:
    result = run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
        "-i", url, "-map", "0:a:0?", "-vn", "-ac", "1", "-ar", "16000",
        "-c:a", "pcm_s16le", str(destination),
    ])
    if result.returncode != 0 or not destination.exists() or destination.stat().st_size < 4096:
        return False, (result.stderr or "ffmpeg did not produce usable audio")[-4000:]
    return True, ""


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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", default="public/data/criticism-transcript-inventory.json")
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--model", default=os.environ.get("VIDEHA_ASR_MODEL", "base"))
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    from faster_whisper import WhisperModel

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    all_rows = flatten(inventory)
    selected = [row for index, row in enumerate(all_rows) if index % args.shard_count == args.shard_index]
    if args.limit:
        selected = selected[:args.limit]
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"Canonical recordings: {len(all_rows)}; shard {args.shard_index}/{args.shard_count}: {len(selected)}", flush=True)

    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=max(2, os.cpu_count() or 2), num_workers=1)
    records = []
    failures = []
    with tempfile.TemporaryDirectory(prefix="videha-asr-") as temp:
        work = Path(temp)
        for number, row in enumerate(selected, 1):
            item_id = stable_id(row["part"], row["logicalSource"])
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
                records.append(failure)
                failures.append(failure)
                wav.unlink(missing_ok=True)
                continue
            try:
                record = transcribe_one(model, row, wav, args.model)
                records.append(record)
                if record["status"] != "asr-draft":
                    failures.append(record)
                print(f"  -> {record['status']} · {len(record.get('plainText',''))} chars", flush=True)
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
                records.append(failure)
                failures.append(failure)
            finally:
                wav.unlink(missing_ok=True)

    result = {
        "schemaVersion": 1,
        "generated": datetime.now(timezone.utc).isoformat(),
        "inventoryGenerated": inventory.get("generated"),
        "asrModel": args.model,
        "shardIndex": args.shard_index,
        "shardCount": args.shard_count,
        "canonicalRecordingCount": len(all_rows),
        "selectedCount": len(selected),
        "draftCount": sum(record.get("status") == "asr-draft" for record in records),
        "failureCount": len(failures),
        "records": records,
    }
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Completed {len(records)}; drafts {result['draftCount']}; failures {len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
