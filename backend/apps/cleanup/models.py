"""Auto-cleanup edit instructions (docs/DATABASE.md — CleanupOperation).

Each row is a time region the user chose to cut from the source video (a silence
or a long breath/pause). They are *edit instructions* layered on top of the
transcript edits — the source video is never modified; the cuts are applied at
export time (docs/ARCHITECTURE.md — Apply Cleanup).
"""
from django.db import models

from apps.common.models import BaseModel


class CleanupOperation(BaseModel):
    class Kind(models.TextChoices):
        SILENCE = "silence", "Silence"
        BREATH = "breath", "Breath"

    project = models.ForeignKey(
        "projects.Project",
        related_name="cleanup_operations",
        on_delete=models.CASCADE,
    )
    type = models.CharField(max_length=16, choices=Kind.choices)
    start_time = models.FloatField()
    end_time = models.FloatField()

    class Meta:
        ordering = ("start_time",)

    def __str__(self) -> str:
        return f"{self.type} {self.start_time:.2f}-{self.end_time:.2f}"
