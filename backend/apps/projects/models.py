"""Project model — the top-level container for a reel (docs/DATABASE.md).

Each project belongs to a user and moves through an explicit status state machine
(docs/ARCHITECTURE.md). Later epics attach scripts, videos, transcripts, etc.
"""
from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class Project(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        UPLOADING = "UPLOADING", "Uploading"
        PROCESSING = "PROCESSING", "Processing"
        READY_FOR_EDITING = "READY_FOR_EDITING", "Ready for editing"
        EXPORTING = "EXPORTING", "Exporting"
        COMPLETED = "COMPLETED", "Completed"
        FAILED_UPLOAD = "FAILED_UPLOAD", "Failed upload"
        FAILED_TRANSCRIPT = "FAILED_TRANSCRIPT", "Failed transcript"
        FAILED_EXPORT = "FAILED_EXPORT", "Failed export"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="projects",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=200)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title
