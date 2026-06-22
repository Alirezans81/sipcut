"""Subtitle generation (Epic 10).

Subtitles are generated from the transcript — the source of truth — as an SRT
file stored for burn-in at export. Deleted segments are omitted. Timing here is
relative to the source video; the export step (Epic 13) re-times captions onto
the final cut. Switching presets only changes styling, never the cues.
"""
from __future__ import annotations

from django.core.files.base import ContentFile
from rest_framework import serializers

from apps.projects.models import Project

from .models import Subtitle
from .presets import SUBTITLE_PRESETS


def _format_timestamp(seconds: float) -> str:
    ms = max(0, int(round(seconds * 1000)))
    hours, ms = divmod(ms, 3_600_000)
    minutes, ms = divmod(ms, 60_000)
    secs, ms = divmod(ms, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def build_srt(segments) -> str:
    """Render kept, non-empty transcript segments as SRT cue text."""
    blocks: list[str] = []
    index = 1
    for seg in segments:
        if seg.deleted or not seg.text.strip():
            continue
        blocks.append(
            f"{index}\n"
            f"{_format_timestamp(seg.start_time)} --> {_format_timestamp(seg.end_time)}\n"
            f"{seg.text.strip()}\n"
        )
        index += 1
    return "\n".join(blocks)


def generate_subtitles(project: Project, preset: str) -> Subtitle:
    """Generate (or regenerate) the project's subtitle track with ``preset``."""
    if preset not in SUBTITLE_PRESETS:
        raise serializers.ValidationError("استایل زیرنویس نامعتبر است.")

    transcript = getattr(project, "transcript", None)
    if transcript is None:
        raise serializers.ValidationError("ابتدا باید رونویسی پروژه انجام شود.")

    srt = build_srt(transcript.segments.all())

    subtitle, _ = Subtitle.objects.get_or_create(project=project)
    subtitle.preset = preset
    subtitle.file.delete(save=False)  # drop the previous file, if any
    subtitle.file.save("subtitles.srt", ContentFile(srt.encode("utf-8")), save=False)
    subtitle.save()
    return subtitle
