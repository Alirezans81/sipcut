"""Video processing Celery tasks (Epic 6)."""
from __future__ import annotations

import logging

from celery import shared_task

from apps.projects.models import Project

from .services import merge_project_clips

logger = logging.getLogger(__name__)


@shared_task
def merge_clips_task(project_id: str) -> str:
    """Merge a project's clips into a single source video.

    First link in the processing chain; returns ``project_id`` so the next task
    (transcript generation) receives it. Marks the project failed and re-raises on
    error so the chain stops.
    """
    project = Project.objects.get(id=project_id)
    try:
        merge_project_clips(project)
    except Exception:
        logger.exception("merge failed for project %s", project_id)
        project.status = Project.Status.FAILED_UPLOAD
        project.save(update_fields=["status", "updated_at"])
        raise
    return project_id
