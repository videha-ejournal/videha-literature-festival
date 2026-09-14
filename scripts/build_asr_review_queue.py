#!/usr/bin/env python3
"""Rank machine ASR records for efficient human editorial review without changing verification state."""
from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path


def score_record(record: dict) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []
    status = str(record.get("status") or "")
    duration = float(record.get("durationSeconds") or 0.0)
    probability = float(record.get("languageProbability") or 0.0)
    text = str(record.get("plainText") or "").strip()
    segments = record.get("segments") or []
    chars_per_second = (len(text) / duration) if duration > 0 else 0.0

    if status == "no-speech-detected":
        score += 100
        reasons.append("no-speech-detected")
    if probability < 0.50:
        score += 45
        reasons.append("very-low-language-probability")
    elif probability < 0.75:
        score += 25
        reasons.append("low-language-probability")
    if status == "asr-draft" and duration > 0 and chars_per_second < 0.45:
        score += 35
        reasons.append("unusually-sparse-transcript")
    elif status == "asr-draft" and duration > 0 and chars_per_second > 24:
        score += 30
        reasons.append("unusually-dense-transcript")
    if status == "asr-draft" and not segments:
        score += 40
        reasons.append("draft-without-segments")
    if duration >= 3600:
        score += 25
        reasons.append("very-long-recording")
    elif duration >= 1800:
        score += 15
        reasons.append("long-recording")
    if not record.get("decodedAudioFingerprintSha256"):
        score += 5
        reasons.append("legacy-record-without-decoded-audio-fingerprint")
    if not record.get("sourceMediaSha256"):
        score += 3
        reasons.append("source-sha256-not-available")
    return score, reasons


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True, help="Directory containing criticism-transcripts-part-*.json")
    p.add_argument("--out-json", required=True)
    p.add_argument("--out-csv", required=True)
    args = p.parse_args()

    records: list[dict] = []
    for path in sorted(Path(args.input).glob("criticism-transcripts-part-*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        records.extend(data.get("records", []))

    queue = []
    for record in records:
        score, reasons = score_record(record)
        duration = float(record.get("durationSeconds") or 0.0)
        text = str(record.get("plainText") or "").strip()
        priority = "high" if score >= 60 else "medium" if score >= 25 else "routine"
        queue.append({
            "id": record.get("id"),
            "part": record.get("part"),
            "logicalSource": record.get("logicalSource"),
            "mediaName": record.get("mediaName"),
            "mediaUrl": record.get("mediaUrl"),
            "status": record.get("status"),
            "detectedLanguage": record.get("detectedLanguage"),
            "languageProbability": record.get("languageProbability"),
            "durationSeconds": round(duration, 3),
            "transcriptCharacters": len(text),
            "charactersPerSecond": round((len(text) / duration) if duration > 0 else 0.0, 4),
            "reviewScore": score,
            "priority": priority,
            "reasons": reasons,
            "humanVerified": False,
            "editorialReview": "not-reviewed",
        })
    queue.sort(key=lambda item: (-int(item["reviewScore"]), int(item.get("part") or 0), str(item.get("logicalSource") or "").lower()))

    payload = {
        "schemaVersion": 1,
        "generated": datetime.now(timezone.utc).isoformat(),
        "purpose": "Machine-generated priority queue for human review; it does not change verification status.",
        "records": len(queue),
        "highPriority": sum(item["priority"] == "high" for item in queue),
        "mediumPriority": sum(item["priority"] == "medium" for item in queue),
        "routinePriority": sum(item["priority"] == "routine" for item in queue),
        "queue": queue,
    }
    Path(args.out_json).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    fieldnames = [
        "id", "part", "logicalSource", "mediaName", "mediaUrl", "status", "detectedLanguage",
        "languageProbability", "durationSeconds", "transcriptCharacters", "charactersPerSecond",
        "reviewScore", "priority", "reasons", "humanVerified", "editorialReview",
    ]
    with Path(args.out_csv).open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for item in queue:
            row = dict(item)
            row["reasons"] = ";".join(item["reasons"])
            writer.writerow(row)
    print(json.dumps({k: payload[k] for k in ("records", "highPriority", "mediumPriority", "routinePriority")}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
