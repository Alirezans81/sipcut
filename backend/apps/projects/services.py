"""Project-level orchestration (Epic 6).

``start_processing`` kicks off the asynchronous pipeline that turns a project's
uploaded clips into an editable reel: merge clips → generate transcript → ready
for editing (docs/USER_JOURNEY.md — Screen 6).
"""
from __future__ import annotations

from celery import chain
from rest_framework import serializers

from .models import Project


def start_processing(project: Project) -> Project:
    """Move the project into PROCESSING and enqueue the merge→transcript chain."""
    if not project.videos.exists():
        raise serializers.ValidationError("برای پردازش حداقل یک کلیپ لازم است.")
    if project.status == Project.Status.PROCESSING:
        raise serializers.ValidationError("پردازش این پروژه در حال انجام است.")

    project.status = Project.Status.PROCESSING
    project.save(update_fields=["status", "updated_at"])

    # Imported here to avoid a circular import at module load (tasks import models).
    from apps.transcripts.tasks import generate_transcript_task
    from apps.videos.tasks import merge_clips_task

    chain(
        merge_clips_task.s(str(project.id)),
        generate_transcript_task.s(),
    ).apply_async()

    return project
