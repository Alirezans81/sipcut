"""Script generation service.

Runs synchronously: a single AI call backs an interactive chat, so the result is
returned in the request rather than via Celery (which is reserved for heavy media
work, see docs/ARCHITECTURE.md).
"""
from __future__ import annotations

from apps.ai.providers import get_provider
from apps.projects.models import Project

from .models import Script


def generate_script_for_project(project: Project, prompt: str) -> Script:
    """Generate a script via the active AI provider and persist it.

    Regenerating overwrites the project's existing script (one per project).
    """
    data = get_provider().generate_script(prompt)

    script, _ = Script.objects.update_or_create(
        project=project,
        defaults={
            "title": data["title"],
            "hook": data["hook"],
            "script": data["script"],
            "shot_list": data["shot_list"],
            "cta": data["cta"],
        },
    )
    return script
