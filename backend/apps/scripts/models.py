"""Script model — the AI-generated content plan for a project (docs/DATABASE.md).

Each project has at most one script; regenerating replaces it. The structured
fields mirror the required output (docs/README Module 1): title, hook, script,
shot list, CTA.
"""
from django.db import models

from apps.common.models import BaseModel


class Script(BaseModel):
    project = models.OneToOneField(
        "projects.Project",
        related_name="script",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=200, blank=True, default="")
    hook = models.TextField(blank=True, default="")
    script = models.TextField(blank=True, default="")
    shot_list = models.JSONField(default=list, blank=True)
    cta = models.TextField(blank=True, default="")

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title or f"Script for {self.project_id}"
