#!/usr/bin/env python3
"""Inventory the twelve Videha Discussion & Criticism Internet Archive collections.

The output is evidence, not a verification claim. It records original/derivative media and
caption/transcript-like files so later ASR only runs where no source text is available.
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USER_AGENT = "Videha-Transcript-Inventory/1.0"
PARTS = range(1, 13)
MEDIA_EXTS = {".mp3", ".m4a", ".aac", ".wav", ".ogg", ".opus", ".mp4", ".m4v", ".webm", ".mov", ".mkv"}
TEXT_EXTS = {".vtt", ".srt", ".ass", ".ssa", ".txt", ".json"}
TEXT_HINTS = ("caption", "subtitle", "subtitles", "transcript", "speech", "asr", "whisper", "vtt", "srt")


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


def is_media(file: dict) -> bool:
    name = str(file.get("name", ""))
    if ext(name) not in MEDIA_EXTS:
        return False
    fmt = str(file.get("format", "")).lower()
    # Exclude common tiny thumbnails/previews mislabeled by extension.
    try:
        size = int(file.get("size") or 0)
    except Exception:
        size = 0
    return size >= 64 * 1024 and "thumbnail" not in fmt


def main() -> int:
    out = Path(os.environ.get("VIDEHA_TRANSCRIPT_INVENTORY", "public/data/criticism-transcript-inventory.json"))
    out.parent.mkdir(parents=True, exist_ok=True)
    collections = []
    media_total = 0
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
            base = {
                "name": name,
                "format": file.get("format") or "",
                "source": file.get("source") or "",
                "original": file.get("original") or "",
                "size": int(file.get("size") or 0) if str(file.get("size") or "0").isdigit() else None,
                "url": download_url(identifier, name),
            }
            if is_media(file):
                media.append(base)
            if likely_text(file):
                text_assets.append(base)
        media_total += len(media)
        text_total += len(text_assets)
        collections.append({
            "part": part,
            "identifier": identifier,
            "title": metadata.get("title") or f"Videha Discussion & Criticism Part {part}",
            "detailsUrl": f"https://archive.org/details/{identifier}",
            "metadataUrl": f"https://archive.org/metadata/{identifier}",
            "mediaCount": len(media),
            "textAssetCount": len(text_assets),
            "media": media,
            "textAssets": text_assets,
        })
        print(f"Part {part}: {len(media)} media, {len(text_assets)} transcript/caption candidates", flush=True)

    result = {
        "schemaVersion": 1,
        "generated": datetime.now(timezone.utc).isoformat(),
        "source": "Internet Archive metadata API",
        "policy": "This inventory does not mark any text as human verified. Source caption/transcript assets and machine ASR drafts require separate provenance and review states.",
        "summary": {
            "collectionsExpected": 12,
            "collectionsRead": len(collections),
            "mediaFiles": media_total,
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
