"""Transcript generation Celery task (Epic 6)."""
from __future__ import annotations

import logging

from celery import shared_task

from apps.projects.models import Project

from .services import generate_project_transcript

logger = logging.getLogger(__name__)


@shared_task
def generate_transcript_task(project_id: str) -> str:
    """Transcribe the project's source video, then mark it ready for editing.

    Second link in the processing chain — receives ``project_id`` from the merge
    task. The transcript + merged video together form the timeline read model.
    """
    project = Project.objects.get(id=project_id)
    try:
        generate_project_transcript(project)
    except Exception:
        logger.exception("transcript failed for project %s", project_id)
        project.status = Project.Status.FAILED_TRANSCRIPT
        project.save(update_fields=["status", "updated_at"])
        raise

    project.status = Project.Status.READY_FOR_EDITING
    project.save(update_fields=["status", "updated_at"])
    return project_id
