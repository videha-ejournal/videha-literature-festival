#!/usr/bin/env python3
"""Merge Videha criticism ASR shards into per-collection transcript datasets and a manifest."""
from __future__ import annotations

import argparse
import json
import urllib.parse
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

RELEASE_TAG = "criticism-transcripts-v1"
REPO = "videha-ejournal/videha-literature-festival"
VALID_COVERAGE_STATUSES = {"asr-draft", "no-speech-detected"}


def asset_url(name: str) -> str:
    return f"https://github.com/{REPO}/releases/download/{RELEASE_TAG}/{urllib.parse.quote(name)}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()

    inputs = sorted(Path(args.input).rglob("asr-shard-*.json"))
    if not inputs:
        raise SystemExit("No ASR shard JSON files found")
    expected_counts = set()
    model_names = set()
    records_by_id = {}
    shard_indexes = set()
    shard_count = None
    for file in inputs:
        data = json.loads(file.read_text(encoding="utf-8"))
        expected_counts.add(int(data.get("canonicalRecordingCount") or 0))
        model_names.add(str(data.get("asrModel") or ""))
        shard_indexes.add(int(data.get("shardIndex") or 0))
        shard_count = int(data.get("shardCount") or shard_count or 0)
        for record in data.get("records", []):
            records_by_id[record["id"]] = record
    expected = max(expected_counts) if expected_counts else 0
    records = sorted(records_by_id.values(), key=lambda r: (int(r.get("part") or 0), str(r.get("logicalSource") or "").lower()))
    statuses = Counter(str(r.get("status") or "unknown") for r in records)
    covered = sum(statuses.get(status, 0) for status in VALID_COVERAGE_STATUSES)
    complete = bool(expected) and len(records) == expected and covered == expected

    output = Path(args.out)
    output.mkdir(parents=True, exist_ok=True)
    groups = defaultdict(list)
    for record in records:
        groups[int(record.get("part") or 0)].append(record)
    parts = []
    for part in range(1, 13):
        part_records = groups.get(part, [])
        name = f"criticism-transcripts-part-{part:02d}.json"
        part_data = {
            "schemaVersion": 2,
            "generated": datetime.now(timezone.utc).isoformat(),
            "part": part,
            "status": "machine-asr-accessibility-aids",
            "humanVerified": False,
            "editorialReview": "not-reviewed",
            "records": part_records,
        }
        (output / name).write_text(json.dumps(part_data, ensure_ascii=False, indent=2), encoding="utf-8")
        parts.append({
            "part": part,
            "records": len(part_records),
            "asrDrafts": sum(r.get("status") == "asr-draft" for r in part_records),
            "noSpeechDetected": sum(r.get("status") == "no-speech-detected" for r in part_records),
            "asset": name,
            "url": asset_url(name),
        })

    manifest_name = "criticism-transcript-manifest.json"
    manifest = {
        "schemaVersion": 2,
        "generated": datetime.now(timezone.utc).isoformat(),
        "releaseTag": RELEASE_TAG,
        "releaseUrl": f"https://github.com/{REPO}/releases/tag/{RELEASE_TAG}",
        "status": "complete-machine-asr-coverage" if complete else "incomplete-machine-asr-coverage",
        "complete": complete,
        "expectedCanonicalRecordings": expected,
        "processedRecords": len(records),
        "coveredRecords": covered,
        "statusCounts": dict(sorted(statuses.items())),
        "models": sorted(model_names),
        "shardsExpected": shard_count,
        "shardsPresent": len(shard_indexes),
        "missingShards": [i for i in range(shard_count or 0) if i not in shard_indexes],
        "humanVerified": False,
        "editorialReview": "not-reviewed",
        "claimBoundary": "These are machine ASR accessibility aids. Spoken-text records are machine drafts; no-speech records mean the ASR emitted no speech text. Neither state is publisher-caption or human/editorial verification.",
        "parts": parts,
    }
    (output / manifest_name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: manifest[k] for k in ("status", "expectedCanonicalRecordings", "processedRecords", "coveredRecords", "statusCounts", "shardsExpected", "shardsPresent")}, ensure_ascii=False))
    if args.require_complete and not complete:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
