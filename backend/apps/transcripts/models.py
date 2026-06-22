"""Transcript models — the source of truth for editing (docs/DATABASE.md).

The transcript is generated from the merged source video (Epic 6). Users edit the
transcript and those edits drive every downstream cut (docs/ARCHITECTURE.md —
Transcript-Centric Architecture). Deleting a segment marks it ``deleted`` rather
than removing the row, so edits stay non-destructive and reversible.
"""
from django.db import models

from apps.common.models import BaseModel


class Transcript(BaseModel):
    project = models.OneToOneField(
        "projects.Project",
        related_name="transcript",
        on_delete=models.CASCADE,
    )

    def __str__(self) -> str:
        return f"transcript<{self.project_id}>"


class TranscriptSegment(BaseModel):
    transcript = models.ForeignKey(
        Transcript,
        related_name="segments",
        on_delete=models.CASCADE,
    )
    text = models.TextField(blank=True, default="")
    start_time = models.FloatField(default=0)  # seconds into the source video
    end_time = models.FloatField(default=0)
    deleted = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "start_time")

    def __str__(self) -> str:
        return self.text[:40]
