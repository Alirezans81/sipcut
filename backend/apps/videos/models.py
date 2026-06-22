"""Video model — an uploaded source clip (docs/DATABASE.md).

Clips belong to a project and carry an explicit ``order`` so the user can arrange
them before merging (Epic 6). Files live in object storage (Arvan Cloud in prod,
local disk in dev) via Django's storage backend.
"""
from django.db import models

from apps.common.models import BaseModel


def clip_upload_path(instance: "Video", filename: str) -> str:
    # uploads/projects/<project_id>/clips/<filename> (docs/ARCHITECTURE.md).
    return f"projects/{instance.project_id}/clips/{filename}"


def source_upload_path(instance: "SourceVideo", filename: str) -> str:
    # uploads/projects/<project_id>/merged/<filename> (docs/ARCHITECTURE.md).
    return f"projects/{instance.project_id}/merged/{filename}"


class Video(BaseModel):
    project = models.ForeignKey(
        "projects.Project",
        related_name="videos",
        on_delete=models.CASCADE,
    )
    file = models.FileField(upload_to=clip_upload_path)
    name = models.CharField(max_length=255, blank=True, default="")
    duration = models.FloatField(default=0)  # seconds; 0 until known
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "created_at")

    def __str__(self) -> str:
        return self.name or self.file.name


class SourceVideo(BaseModel):
    """The single merged reel produced from a project's clips (Epic 6).

    Regenerating the merge replaces the file in place, so this is one-to-one with
    a project and acts as the source of truth that the transcript and all later
    edits (cuts, color, music, export) are derived from.
    """

    project = models.OneToOneField(
        "projects.Project",
        related_name="source_video",
        on_delete=models.CASCADE,
    )
    file = models.FileField(upload_to=source_upload_path)
    duration = models.FloatField(default=0)  # seconds

    def __str__(self) -> str:
        return f"source<{self.project_id}>"
