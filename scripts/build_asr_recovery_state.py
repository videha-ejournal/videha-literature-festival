#!/usr/bin/env python3
"""Build an auditable recovery-state manifest and execution matrices for Videha ASR."""
from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

VALID_COVERAGE_STATUSES = {"asr-draft", "no-speech-detected"}


def stable_id(part: int, logical_source: str) -> str:
    return f"p{part:02d}-{hashlib.sha1(f'{part}|{logical_source}'.encode('utf-8')).hexdigest()[:14]}"


def flatten(inventory: dict) -> list[dict]:
    rows = []
    for collection in inventory.get("collections", []):
        part = int(collection["part"])
        for item in collection.get("canonicalMedia", []):
            rows.append({"part": part, "identifier": collection["identifier"], **item})
    return sorted(rows, key=lambda row: (row["part"], str(row["logicalSource"]).lower()))


def source_bytes(row: dict) -> int:
    try:
        return max(0, int(row.get("selectedBytes") or 0))
    except (TypeError, ValueError):
        return 0


def covered_record(record: dict) -> bool:
    return (
        record.get("status") in VALID_COVERAGE_STATUSES
        and record.get("humanVerified") is False
        and record.get("editorialReview") == "not-reviewed"
        and bool(record.get("id"))
    )


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def compatible(data: dict, shard: int, shard_count: int, canonical_count: int, model: str) -> bool:
    return (
        int(data.get("shardIndex", -1)) == shard
        and int(data.get("shardCount", -1)) == shard_count
        and int(data.get("canonicalRecordingCount", -1)) == canonical_count
        and str(data.get("asrModel") or "") == model
    )


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--inventory", required=True)
    p.add_argument("--assets", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--shard-count", type=int, required=True)
    p.add_argument("--model", required=True)
    p.add_argument("--long-threshold-bytes", type=int, default=67108864)
    p.add_argument("--long-duration-seconds", type=int, default=1800)
    args = p.parse_args()

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    rows = flatten(inventory)
    canonical_count = len(rows)
    assets = Path(args.assets)
    by_shard = {
        shard: [row for index, row in enumerate(rows) if index % args.shard_count == shard]
        for shard in range(args.shard_count)
    }
    canonical_records = 0
    missing_shards: list[int] = []
    normal_matrix: list[int] = []
    long_matrix: list[dict] = []
    shard_states: list[dict] = []
    recoverable_covered_total = 0
    partial_total = 0

    record_assets = list(assets.glob("asr-record-*.json"))
    record_data = [(path, load_json(path)) for path in record_assets]

    for shard in range(args.shard_count):
        expected_rows = by_shard[shard]
        expected_ids = {stable_id(int(r["part"]), str(r["logicalSource"])) for r in expected_rows}
        canonical = assets / f"asr-shard-{shard:03d}.json"
        canonical_data = load_json(canonical) if canonical.exists() else None
        canonical_ok = False
        if canonical_data and compatible(canonical_data, shard, args.shard_count, canonical_count, args.model):
            records = canonical_data.get("records", [])
            ids = [str(r.get("id") or "") for r in records]
            canonical_ok = (
                int(canonical_data.get("selectedCount", -1)) == len(expected_rows)
                and int(canonical_data.get("coveredCount", -1)) == len(expected_rows)
                and int(canonical_data.get("failureCount", -1)) == 0
                and len(records) == len(expected_rows)
                and len(set(ids)) == len(expected_rows)
                and set(ids) == expected_ids
                and all(covered_record(r) for r in records)
            )
        if canonical_ok:
            canonical_records += len(expected_rows)
            recoverable_covered_total += len(expected_rows)
            shard_states.append({
                "shard": shard,
                "selected": len(expected_rows),
                "canonical": True,
                "canonicalCovered": len(expected_rows),
                "recoverableCovered": len(expected_rows),
                "partialRecordings": 0,
                "pending": 0,
                "longPending": 0,
            })
            continue

        missing_shards.append(shard)
        covered: dict[str, dict] = {}
        partials: dict[str, dict] = {}
        generation = 0
        digest = ""
        run_history: list[str] = []
        last_event = ""
        last_event_at = ""
        last_workflow_run_id = ""
        last_workflow_run_attempt = 0
        checkpoint = assets / f"asr-checkpoint-{shard:03d}.json"
        candidates: list[tuple[Path, dict | None]] = []
        if checkpoint.exists():
            candidates.append((checkpoint, load_json(checkpoint)))
        for path, data in record_data:
            if data and compatible(data, shard, args.shard_count, canonical_count, args.model):
                candidates.append((path, data))
        for path, data in candidates:
            if not data or not compatible(data, shard, args.shard_count, canonical_count, args.model):
                continue
            gen = int(data.get("checkpointGeneration") or 0)
            if gen >= generation:
                generation = gen
                digest = str(data.get("checkpointDigestSha256") or digest)
                last_event = str(data.get("lastEvent") or data.get("checkpointCause") or last_event)
                last_event_at = str(data.get("lastEventAt") or data.get("generated") or last_event_at)
                last_workflow_run_id = str(data.get("workflowRunId") or last_workflow_run_id)
                last_workflow_run_attempt = int(data.get("workflowRunAttempt") or last_workflow_run_attempt or 0)
            for run_id in data.get("recoveryRunHistory", []):
                run_id = str(run_id or "")
                if run_id and run_id not in run_history:
                    run_history.append(run_id)
            direct_run_id = str(data.get("workflowRunId") or "")
            if direct_run_id and direct_run_id not in run_history:
                run_history.append(direct_run_id)
            for record in data.get("records", []):
                item_id = str(record.get("id") or "")
                if item_id in expected_ids and covered_record(record):
                    covered[item_id] = record
                    partials.pop(item_id, None)
            for partial in data.get("partialRecordings", []):
                item_id = str(partial.get("id") or "")
                if not item_id or item_id not in expected_ids or item_id in covered:
                    continue
                existing = partials.get(item_id)
                current_progress = len(partial.get("chunks", []))
                existing_progress = len(existing.get("chunks", [])) if existing else -1
                if current_progress > existing_progress:
                    partials[item_id] = partial

        pending_rows = []
        long_pending_rows = []
        normal_pending_rows = []
        for row in expected_rows:
            item_id = stable_id(int(row["part"]), str(row["logicalSource"]))
            if item_id in covered:
                continue
            pending_rows.append(row)
            partial = partials.get(item_id) or {}
            duration = float(partial.get("durationSeconds") or 0.0)
            is_long = source_bytes(row) >= args.long_threshold_bytes or duration >= args.long_duration_seconds
            entry = {
                "shard": shard,
                "id": item_id,
                "part": int(row["part"]),
                "logicalSource": row["logicalSource"],
                "mediaName": row.get("selectedName"),
                "sourceBytes": source_bytes(row),
                "knownDurationSeconds": round(duration, 3),
                "completedChunks": len(partial.get("chunks", [])),
                "expectedChunks": int(partial.get("expectedChunkCount") or 0),
                "partialUpdated": str(partial.get("updated") or ""),
            }
            if is_long:
                long_pending_rows.append(entry)
                long_matrix.append({"shard": shard, "id": item_id})
            else:
                normal_pending_rows.append(entry)
        if normal_pending_rows:
            normal_matrix.append(shard)
        recoverable_covered_total += len(covered)
        partial_total += len(partials)
        current_partial = max(partials.values(), key=lambda p: str(p.get("updated") or ""), default=None)
        shard_states.append({
            "shard": shard,
            "selected": len(expected_rows),
            "canonical": False,
            "canonicalCovered": 0,
            "recoverableCovered": len(covered),
            "partialRecordings": len(partials),
            "pending": len(pending_rows),
            "longPending": len(long_pending_rows),
            "checkpointGeneration": generation,
            "checkpointDigestSha256": digest,
            "lastSuccessfulCheckpointAt": last_event_at,
            "lastFailureOrRecoveryEvent": last_event,
            "lastFailureOrRecoveryEventAt": last_event_at,
            "attemptCount": len(run_history),
            "recoveryRunHistory": run_history,
            "lastWorkflowRunId": last_workflow_run_id,
            "lastWorkflowRunAttempt": last_workflow_run_attempt,
            "currentMedia": ({
                "id": current_partial.get("id"),
                "mediaName": current_partial.get("mediaName"),
                "logicalSource": current_partial.get("logicalSource"),
                "durationSeconds": current_partial.get("durationSeconds"),
                "sourceMediaBytes": current_partial.get("sourceMediaBytes"),
                "completedChunks": len(current_partial.get("chunks", [])),
                "expectedChunks": current_partial.get("expectedChunkCount"),
                "updated": current_partial.get("updated"),
            } if current_partial else None),
            "normalPendingRecords": normal_pending_rows,
            "longPendingRecords": long_pending_rows,
        })

    payload = {
        "schemaVersion": 1,
        "generated": datetime.now(timezone.utc).isoformat(),
        "asrModel": args.model,
        "expectedCanonicalRecordings": canonical_count,
        "shardsExpected": args.shard_count,
        "canonicalShardsPresent": args.shard_count - len(missing_shards),
        "missingShards": missing_shards,
        "canonicalRecordings": canonical_records,
        "recoverableCoveredRecordings": recoverable_covered_total,
        "partialRecordingStates": partial_total,
        "longThresholdBytes": args.long_threshold_bytes,
        "longDurationSeconds": args.long_duration_seconds,
        "normalShardMatrix": normal_matrix,
        "longRecordingMatrix": long_matrix,
        "assembleShardMatrix": missing_shards,
        "shards": shard_states,
    }
    Path(args.out).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "canonicalRecordings": canonical_records,
        "recoverableCoveredRecordings": recoverable_covered_total,
        "canonicalShardsPresent": args.shard_count - len(missing_shards),
        "missingShards": missing_shards,
        "normalShardMatrix": normal_matrix,
        "longRecordingCount": len(long_matrix),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
