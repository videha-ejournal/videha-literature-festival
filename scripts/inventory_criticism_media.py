#!/usr/bin/env python3
"""Inventory the twelve Videha Discussion & Criticism Internet Archive collections.

The output is evidence, not a verification claim. It records all media and source text assets,
then collapses Internet Archive derivatives onto one canonical download per logical recording
for transcription. A smaller audio derivative is preferred over a large video when both point
to the same original, because ASR needs the audio content rather than duplicate pixels.
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USER_AGENT = "Videha-Transcript-Inventory/1.1"
PARTS = range(1, 13)
MEDIA_EXTS = {".mp3", ".m4a", ".aac", ".wav", ".flac", ".ogg", ".opus", ".mp4", ".m4v", ".webm", ".mov", ".mkv", ".ogv"}
AUDIO_EXTS = {".mp3", ".m4a", ".aac", ".wav", ".flac", ".ogg", ".opus"}
TEXT_HINTS = ("caption", "subtitle", "subtitles", "transcript", "speech", "asr", "whisper", "vtt", "srt")
AUDIO_PRIORITY = {".m4a": 0, ".mp3": 1, ".opus": 2, ".ogg": 3, ".aac": 4, ".flac": 5, ".wav": 6}
VIDEO_PRIORITY = {".mp4": 20, ".webm": 21, ".m4v": 22, ".mov": 23, ".mkv": 24, ".ogv": 25}


def get_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def ext(name: str) -> str:
    return Path(name).suffix.lower()


def download_url(identifier: str, name: str) -> str:
    return f"https://archive.org/download/{urllib.parse.quote(identifier, safe='')}/{urllib.parse.quote(name, safe='/')}"


def likely_text(file: dict) -> bool:
    name = str(file.get("name", ""))
    low = name.lower()
    suffix = ext(name)
    if suffix in {".vtt", ".srt", ".ass", ".ssa"}:
        return True
    if suffix in {".txt", ".json"} and any(hint in low for hint in TEXT_HINTS):
        return True
    fmt = str(file.get("format", "")).lower()
    return any(hint in fmt for hint in ("subtitle", "caption", "transcript", "speech"))


def media_size(file: dict) -> int:
    try:
        return int(file.get("size") or 0)
    except Exception:
        return 0


def is_media(file: dict) -> bool:
    name = str(file.get("name", ""))
    if ext(name) not in MEDIA_EXTS:
        return False
    fmt = str(file.get("format", "")).lower()
    return media_size(file) >= 64 * 1024 and "thumbnail" not in fmt


def media_record(identifier: str, file: dict) -> dict:
    name = str(file.get("name", ""))
    return {
        "name": name,
        "format": file.get("format") or "",
        "source": file.get("source") or "",
        "original": file.get("original") or "",
        "size": media_size(file),
        "url": download_url(identifier, name),
    }


def logical_key(record: dict, media_names: set[str]) -> str:
    original = str(record.get("original") or "")
    if original and original in media_names:
        return original
    return record["name"]


def preference(record: dict) -> tuple:
    suffix = ext(record["name"])
    # Prefer compressed audio for ASR efficiency, then other audio, then video.
    rank = AUDIO_PRIORITY.get(suffix, VIDEO_PRIORITY.get(suffix, 50))
    source_rank = 0 if str(record.get("source", "")).lower() == "original" else 1
    # Within a format prefer the original, then the larger derivative as a rough quality proxy.
    return (rank, source_rank, -int(record.get("size") or 0), record["name"].lower())


def canonicalize(media: list[dict]) -> list[dict]:
    names = {record["name"] for record in media}
    groups: dict[str, list[dict]] = {}
    for record in media:
        groups.setdefault(logical_key(record, names), []).append(record)
    result = []
    for key, candidates in sorted(groups.items(), key=lambda item: item[0].lower()):
        selected = sorted(candidates, key=preference)[0]
        result.append({
            "logicalSource": key,
            "selectedName": selected["name"],
            "selectedUrl": selected["url"],
            "selectedFormat": selected["format"],
            "selectedBytes": selected["size"],
            "selectedSourceClass": selected["source"],
            "mediaVariants": len(candidates),
            "hasAudioDerivative": any(ext(candidate["name"]) in AUDIO_EXTS for candidate in candidates),
        })
    return result


def main() -> int:
    out = Path(os.environ.get("VIDEHA_TRANSCRIPT_INVENTORY", "public/data/criticism-transcript-inventory.json"))
    out.parent.mkdir(parents=True, exist_ok=True)
    collections = []
    media_total = 0
    canonical_total = 0
    text_total = 0
    failures = []

    for part in PARTS:
        identifier = f"videha-discussion-criticism-part-{part}"
        try:
            data = get_json(f"https://archive.org/metadata/{identifier}")
        except Exception as exc:
            failures.append({"part": part, "identifier": identifier, "error": f"{type(exc).__name__}: {exc}"})
            continue
        metadata = data.get("metadata") or {}
        files = data.get("files") or []
        media = []
        text_assets = []
        for file in files:
            name = str(file.get("name", ""))
            if not name:
                continue
            base = media_record(identifier, file)
            if is_media(file):
                media.append(base)
            if likely_text(file):
                text_assets.append(base)
        canonical = canonicalize(media)
        media_total += len(media)
        canonical_total += len(canonical)
        text_total += len(text_assets)
        collections.append({
            "part": part,
            "identifier": identifier,
            "title": metadata.get("title") or f"Videha Discussion & Criticism Part {part}",
            "detailsUrl": f"https://archive.org/details/{identifier}",
            "metadataUrl": f"https://archive.org/metadata/{identifier}",
            "mediaCount": len(media),
            "canonicalRecordingCount": len(canonical),
            "textAssetCount": len(text_assets),
            "canonicalMedia": canonical,
            "media": media,
            "textAssets": text_assets,
        })
        print(f"Part {part}: {len(media)} media variants -> {len(canonical)} canonical recordings; {len(text_assets)} transcript/caption candidates", flush=True)

    result = {
        "schemaVersion": 2,
        "generated": datetime.now(timezone.utc).isoformat(),
        "source": "Internet Archive metadata API",
        "policy": "This inventory does not mark any text as human verified. Source caption/transcript assets and machine ASR drafts require separate provenance and review states. Internet Archive derivatives are deduplicated before ASR.",
        "summary": {
            "collectionsExpected": 12,
            "collectionsRead": len(collections),
            "mediaFiles": media_total,
            "canonicalRecordings": canonical_total,
            "textAssetCandidates": text_total,
            "failures": len(failures),
        },
        "failures": failures,
        "collections": collections,
    }
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
