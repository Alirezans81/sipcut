"""Silence/breath detection and cleanup assembly (Epic 9).

Detection runs FFmpeg's ``silencedetect`` on the merged source video to find
quiet regions, then classifies them by length: longer gaps are silences, shorter
ones are treated as breaths/pauses. Results are stored as non-destructive
:class:`CleanupOperation` edit instructions (applied at export).
"""
from __future__ import annotations

from django.conf import settings
from rest_framework import serializers

from apps.common import ffmpeg
from apps.projects.models import Project

from .models import CleanupOperation


def _source_path(project: Project) -> str:
    source = getattr(project, "source_video", None)
    if source is None or not source.file:
        raise serializers.ValidationError("ابتدا باید ویدیوی پروژه پردازش شود.")
    return source.file.path


def detect_cleanup(project: Project, kind: str) -> list[CleanupOperation]:
    """Detect and persist cleanup regions of ``kind`` ("silence" or "breath").

    Re-running replaces the existing operations of that kind for the project.
    """
    silence_min = settings.CLEANUP_SILENCE_MIN_SECONDS
    breath_min = settings.CLEANUP_BREATH_MIN_SECONDS

    regions = ffmpeg.detect_silences(
        _source_path(project),
        noise_db=settings.CLEANUP_NOISE_DB,
        min_silence=breath_min,
    )

    selected = []
    for region in regions:
        length = region["end"] - region["start"]
        if kind == CleanupOperation.Kind.SILENCE and length >= silence_min:
            selected.append(region)
        elif kind == CleanupOperation.Kind.BREATH and breath_min <= length < silence_min:
            selected.append(region)

    CleanupOperation.objects.filter(project=project, type=kind).delete()
    return CleanupOperation.objects.bulk_create(
        [
            CleanupOperation(
                project=project,
                type=kind,
                start_time=region["start"],
                end_time=region["end"],
            )
            for region in selected
        ]
    )


def clear_cleanup(project: Project) -> None:
    """Undo all auto-cleanup for a project."""
    CleanupOperation.objects.filter(project=project).delete()


def cleanup_summary(project: Project) -> dict:
    """Counts and total trimmed time for the cleanup panel."""
    operations = list(project.cleanup_operations.all())
    total = sum(op.end_time - op.start_time for op in operations)
    return {
        "silence_count": sum(1 for op in operations if op.type == CleanupOperation.Kind.SILENCE),
        "breath_count": sum(1 for op in operations if op.type == CleanupOperation.Kind.BREATH),
        "total_seconds": round(total, 2),
    }
