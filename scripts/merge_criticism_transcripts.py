#!/usr/bin/env python3
"""Merge canonical Videha criticism ASR shards and enforce the strict corpus gate."""
from __future__ import annotations

import argparse
import hashlib
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


def stable_id(part: int, logical_source: str) -> str:
    return f"p{part:02d}-{hashlib.sha1(f'{part}|{logical_source}'.encode('utf-8')).hexdigest()[:14]}"


def flatten(inventory: dict) -> list[dict]:
    rows = []
    for collection in inventory.get("collections", []):
        part = int(collection["part"])
        for item in collection.get("canonicalMedia", []):
            rows.append({
                "part": part,
                "identifier": collection["identifier"],
                "collectionTitle": collection.get("title", ""),
                **item,
            })
    return sorted(rows, key=lambda row: (row["part"], str(row["logicalSource"]).lower()))


def covered_record(record: dict) -> bool:
    return (
        record.get("status") in VALID_COVERAGE_STATUSES
        and record.get("humanVerified") is False
        and record.get("editorialReview") == "not-reviewed"
        and bool(record.get("id"))
    )


def source_bytes(row: dict) -> int:
    try:
        return max(0, int(row.get("selectedBytes") or 0))
    except (TypeError, ValueError):
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--inventory", required=True)
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    expected_rows = flatten(inventory)
    expected_total = len(expected_rows)
    expected_by_id = {
        stable_id(int(row["part"]), str(row["logicalSource"])): row for row in expected_rows
    }
    expected_ids = set(expected_by_id)
    expected_urls = [str(row.get("selectedUrl") or "") for row in expected_rows]
    expected_url_set = {url for url in expected_urls if url}

    inputs = sorted(Path(args.input).rglob("asr-shard-*.json"))
    if not inputs:
        raise SystemExit("No canonical ASR shard JSON files found")

    model_names = set()
    shard_indexes = set()
    shard_counts = set()
    canonical_counts = set()
    all_records: list[dict] = []
    shard_runtime: list[dict] = []
    invalid_shards: list[dict] = []

    for file in inputs:
        data = json.loads(file.read_text(encoding="utf-8"))
        shard = int(data.get("shardIndex", -1))
        shard_count = int(data.get("shardCount") or 0)
        canonical_count = int(data.get("canonicalRecordingCount") or 0)
        model = str(data.get("asrModel") or "")
        records = data.get("records", [])
        shard_indexes.add(shard)
        shard_counts.add(shard_count)
        canonical_counts.add(canonical_count)
        model_names.add(model)
        shard_runtime.append({"shard": shard, **(data.get("runtimeProvenance") or {})})
        if (
            shard < 0
            or not data.get("completeShard")
            or data.get("checkpoint") is not False
            or int(data.get("failureCount", -1)) != 0
            or int(data.get("coveredCount", -1)) != int(data.get("selectedCount", -2))
            or not all(covered_record(record) for record in records)
        ):
            invalid_shards.append({"file": file.name, "shard": shard})
        all_records.extend(records)

    shard_count = max(shard_counts) if shard_counts else 0
    canonical_count = max(canonical_counts) if canonical_counts else 0
    id_counts = Counter(str(record.get("id") or "") for record in all_records)
    duplicate_ids = sorted(item_id for item_id, count in id_counts.items() if item_id and count > 1)
    records_by_id: dict[str, dict] = {}
    for record in all_records:
        item_id = str(record.get("id") or "")
        if item_id and item_id not in records_by_id:
            records_by_id[item_id] = record

    missing_ids = sorted(expected_ids - set(records_by_id))
    extra_ids = sorted(set(records_by_id) - expected_ids)
    records = []
    for item_id, record in records_by_id.items():
        enriched = dict(record)
        row = expected_by_id.get(item_id)
        if row:
            enriched.setdefault("part", int(row["part"]))
            enriched.setdefault("collectionIdentifier", row["identifier"])
            enriched.setdefault("collectionTitle", row.get("collectionTitle", ""))
            enriched.setdefault("logicalSource", row["logicalSource"])
            enriched.setdefault("mediaName", row.get("selectedName"))
            enriched.setdefault("mediaUrl", row.get("selectedUrl"))
            enriched.setdefault("mediaFormat", row.get("selectedFormat", ""))
            enriched.setdefault("sourceMediaBytes", source_bytes(row))
            enriched.setdefault("sourceMediaSha256", row.get("selectedSha256") or row.get("sha256") or None)
        records.append(enriched)
    records.sort(key=lambda r: (int(r.get("part") or 0), str(r.get("logicalSource") or "").lower()))

    statuses = Counter(str(r.get("status") or "unknown") for r in records)
    covered = sum(statuses.get(status, 0) for status in VALID_COVERAGE_STATUSES)
    actual_urls = [str(r.get("mediaUrl") or "") for r in records if str(r.get("mediaUrl") or "")]
    actual_url_counts = Counter(actual_urls)
    duplicate_urls = sorted(url for url, count in actual_url_counts.items() if count > 1)
    actual_url_set = set(actual_urls)
    missing_urls = sorted(expected_url_set - actual_url_set)
    extra_urls = sorted(actual_url_set - expected_url_set)
    missing_shards = [i for i in range(shard_count or 0) if i not in shard_indexes]

    strict_complete = (
        expected_total == 2346
        and canonical_count == expected_total
        and shard_count == 192
        and len(shard_indexes) == shard_count
        and not missing_shards
        and not invalid_shards
        and len(records) == expected_total
        and covered == expected_total
        and not duplicate_ids
        and not missing_ids
        and not extra_ids
        and not duplicate_urls
        and not missing_urls
        and not extra_urls
        and all(covered_record(record) for record in records)
    )

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
            "schemaVersion": 3,
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

    runtime_images = sorted({
        str((r.get("asrRuntime") or {}).get("runtimeImage") or "")
        for r in records
        if str((r.get("asrRuntime") or {}).get("runtimeImage") or "")
    })
    software_versions = sorted({
        json.dumps({
            "fasterWhisper": (r.get("asrRuntime") or {}).get("fasterWhisper"),
            "ctranslate2": (r.get("asrRuntime") or {}).get("ctranslate2"),
            "onnxruntime": (r.get("asrRuntime") or {}).get("onnxruntime"),
            "python": (r.get("asrRuntime") or {}).get("python"),
        }, sort_keys=True)
        for r in records
        if r.get("asrRuntime")
    })

    manifest_name = "criticism-transcript-manifest.json"
    manifest = {
        "schemaVersion": 3,
        "generated": datetime.now(timezone.utc).isoformat(),
        "releaseTag": RELEASE_TAG,
        "releaseUrl": f"https://github.com/{REPO}/releases/tag/{RELEASE_TAG}",
        "status": "complete-machine-asr-coverage" if strict_complete else "incomplete-machine-asr-coverage",
        "complete": strict_complete,
        "records": len(records),
        "expectedTotal": expected_total,
        "expectedCanonicalRecordings": expected_total,
        "processedRecords": len(records),
        "coveredRecords": covered,
        "statusCounts": dict(sorted(statuses.items())),
        "models": sorted(model_names),
        "shardsExpected": shard_count,
        "shardsPresent": len(shard_indexes),
        "missingShards": missing_shards,
        "invalidCanonicalShards": invalid_shards,
        "duplicateRecordIdCount": len(duplicate_ids),
        "missingRecordIdCount": len(missing_ids),
        "extraRecordIdCount": len(extra_ids),
        "duplicateCanonicalMediaUrlCount": len(duplicate_urls),
        "missingCanonicalMediaUrlCount": len(missing_urls),
        "extraCanonicalMediaUrlCount": len(extra_urls),
        "runtimeImages": runtime_images,
        "softwareVersionSets": [json.loads(item) for item in software_versions],
        "sourceMediaIdentity": {
            "recordsWithSourceBytes": sum(int(r.get("sourceMediaBytes") or 0) > 0 for r in records),
            "recordsWithSourceSha256": sum(bool(r.get("sourceMediaSha256")) for r in records),
            "recordsWithDecodedAudioFingerprintSha256": sum(bool(r.get("decodedAudioFingerprintSha256")) for r in records),
        },
        "humanVerified": False,
        "editorialReview": "not-reviewed",
        "claimBoundary": "These are machine ASR accessibility aids. Spoken-text records are machine drafts; no-speech records mean the ASR emitted no speech text. Neither state is publisher-caption or human/editorial verification.",
        "reviewQueueAsset": "criticism-human-review-queue.json",
        "parts": parts,
    }
    (output / manifest_name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: manifest[k] for k in (
        "status", "records", "expectedTotal", "coveredRecords", "shardsExpected", "shardsPresent",
        "missingShards", "duplicateCanonicalMediaUrlCount", "missingCanonicalMediaUrlCount",
        "extraCanonicalMediaUrlCount", "complete",
    )}, ensure_ascii=False))
    if args.require_complete and not strict_complete:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
