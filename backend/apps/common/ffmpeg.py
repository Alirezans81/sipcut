"""Thin, dependency-free wrappers around the FFmpeg/FFprobe binaries.

All video manipulation in SipCut goes through FFmpeg (docs/ARCHITECTURE.md —
Video Processing Layer). These helpers shell out to the binaries that ship in the
backend Docker image; they take and return plain filesystem paths so they stay
easy to unit-test (the callers mock this module rather than running FFmpeg).
"""
from __future__ import annotations

import json
import logging
import re
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

# Vertical 9:16 reel — the only output format SipCut targets for the MVP.
REEL_WIDTH = 1080
REEL_HEIGHT = 1920
REEL_FPS = 30


class FFmpegError(RuntimeError):
    """Raised when an FFmpeg/FFprobe invocation exits non-zero."""


def _run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    logger.debug("ffmpeg: %s", " ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        logger.error("ffmpeg failed (%s): %s", proc.returncode, proc.stderr[-2000:])
        raise FFmpegError(proc.stderr.strip().splitlines()[-1:] or "ffmpeg failed")
    return proc


def probe_duration(path: str | Path) -> float:
    """Return a media file's duration in seconds (0.0 if unknown)."""
    proc = _run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ]
    )
    try:
        return float(json.loads(proc.stdout)["format"]["duration"])
    except (KeyError, ValueError, json.JSONDecodeError):
        return 0.0


def merge_videos(inputs: list[str | Path], output: str | Path) -> None:
    """Concatenate clips into a single normalized vertical reel.

    Inputs may differ in codec, resolution, and frame rate (phone uploads + webm
    camera recordings), so each is scaled/padded to a common canvas before the
    ``concat`` filter joins them — a plain demuxer concat can't handle that.
    """
    if not inputs:
        raise FFmpegError("no input clips to merge")

    cmd: list[str] = ["ffmpeg", "-y"]
    for src in inputs:
        cmd += ["-i", str(src)]

    # Per-input: scale to fit, pad to the canvas, normalize SAR/fps and audio.
    vf = (
        f"scale={REEL_WIDTH}:{REEL_HEIGHT}:force_original_aspect_ratio=decrease,"
        f"pad={REEL_WIDTH}:{REEL_HEIGHT}:(ow-iw)/2:(oh-ih)/2,"
        f"setsar=1,fps={REEL_FPS}"
    )
    parts: list[str] = []
    streams = ""
    for i in range(len(inputs)):
        parts.append(f"[{i}:v]{vf}[v{i}]")
        parts.append(f"[{i}:a]aresample=async=1:first_pts=0[a{i}]")
        streams += f"[v{i}][a{i}]"
    filter_complex = (
        ";".join(parts)
        + f";{streams}concat=n={len(inputs)}:v=1:a=1[v][a]"
    )

    cmd += [
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(output),
    ]
    _run(cmd)


def extract_audio(video: str | Path, output: str | Path) -> None:
    """Extract a mono 16 kHz WAV track — the format speech-to-text expects."""
    _run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-f",
            "wav",
            str(output),
        ]
    )


def detect_silences(
    path: str | Path,
    noise_db: float = -30.0,
    min_silence: float = 0.25,
) -> list[dict[str, float]]:
    """Find quiet regions in a media file via FFmpeg's ``silencedetect``.

    Returns a list of ``{"start", "end"}`` (seconds). These are the basis for
    silence/breath cleanup — the caller classifies them by length. The original
    media is never modified (docs/ARCHITECTURE.md — non-destructive editing).
    """
    proc = _run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            f"silencedetect=noise={noise_db}dB:d={min_silence}",
            "-f",
            "null",
            "-",
        ]
    )
    # silencedetect reports on stderr: "silence_start: X" / "silence_end: Y ...".
    starts = [float(m) for m in re.findall(r"silence_start:\s*([0-9.]+)", proc.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([0-9.]+)", proc.stderr)]

    regions: list[dict[str, float]] = []
    for start, end in zip(starts, ends):
        if end > start:
            regions.append({"start": round(start, 3), "end": round(end, 3)})
    return regions
