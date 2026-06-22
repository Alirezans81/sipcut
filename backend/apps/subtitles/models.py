"""Subtitle model (docs/DATABASE.md — Subtitle).

One subtitle track per project, generated from the transcript with a chosen style
preset. The generated ``.srt`` file is stored for burn-in at export; switching
presets only changes styling, not timing (docs/USER_JOURNEY.md — Screen 11).
"""
from django.db import models

from apps.common.models import BaseModel


def subtitle_upload_path(instance: "Subtitle", filename: str) -> str:
    return f"projects/{instance.project_id}/subtitles/{filename}"


class Subtitle(BaseModel):
    project = models.OneToOneField(
        "projects.Project",
        related_name="subtitle",
        on_delete=models.CASCADE,
    )
    preset = models.CharField(max_length=32, default="reels")
    file = models.FileField(upload_to=subtitle_upload_path, blank=True)

    def __str__(self) -> str:
        return f"subtitle<{self.project_id}> {self.preset}"
