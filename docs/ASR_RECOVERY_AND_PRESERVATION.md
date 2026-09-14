# Videha criticism ASR recovery and preservation architecture

This workflow preserves the corpus boundary between **canonical machine coverage** and **recovery state**.

## Canonical boundary

Only `asr-shard-NNN.json` is canonical shard data. It is published only after every expected recording in that shard has a valid machine coverage status (`asr-draft` or `no-speech-detected`), `humanVerified=false`, `editorialReview=not-reviewed`, and zero processing failures. `asr-checkpoint-NNN.json` and `asr-record-<id>.json` are durable recovery state and never count as canonical coverage.

## Recovery hardening

- Audio is processed in five-minute chunks. Each completed chunk is persisted before the next chunk begins.
- SIGTERM/SIGINT triggers an emergency atomic checkpoint write/upload before the process exits.
- Large or already-known long recordings are isolated into per-record jobs, so they cannot block or overwrite another recording's recovery state.
- Checkpoints carry a monotonically increasing generation plus previous/current SHA-256 digests. Uploads refuse generation regression or same-generation divergence.
- `asr-recovery-state.json` records canonical coverage, recoverable coverage, partial chunk progress, pending shards, attempt/run history, last recovery/failure event, current media and the long-record execution plan.
- The ASR runtime is built from `docker/asr/Dockerfile` plus `requirements-asr.lock`. The content-keyed GHCR image is reused when available, and every transcription job runs from its resolved immutable image digest.
- Current GitHub JavaScript actions are pinned by commit SHA rather than floating major tags.

## Provenance and source identity

New transcript records retain canonical media URL/name/format, source byte size, any inventory-supplied source SHA-256, and a SHA-256 fingerprint derived from the decoded PCM chunks actually presented to ASR. Runtime image digest and key ASR package versions are recorded with generated data. Legacy records are enriched with source byte-size metadata at merge time where available.

## Human review

`criticism-human-review-queue.json` and `.csv` rank machine records by review risk (for example no-speech state, low language probability, unusually sparse/dense transcript, long duration, missing legacy hash evidence). This queue never changes `humanVerified` or `editorialReview`; it only prioritizes later human work.

## Strict completion gate

The final manifest is complete only when all of the following hold simultaneously:

- `records=2346`
- `expectedTotal=2346`
- `shardsPresent=192`
- `shardsExpected=192`
- `missingShards=[]`
- `duplicateCanonicalMediaUrlCount=0`
- `missingCanonicalMediaUrlCount=0`
- `extraCanonicalMediaUrlCount=0`
- `complete=true`

The merge also rejects invalid canonical shards, duplicate/missing/extra stable record IDs and any record that crosses the machine/human provenance boundary.

## Preservation snapshots

After strict completion, the workflow creates a commit-addressed GitHub release containing a tar.gz preservation bundle, SHA-256 checksum, canonical per-part datasets, strict manifest, recovery-state manifest, review queue, canonical source inventory, dependency lock and workflow provenance. If that snapshot tag already exists, the workflow leaves it unchanged.
