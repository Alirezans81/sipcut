"""GapGPT provider — the current default AI backend.

This is a scaffold: method bodies are wired up in later epics (script generation
in Epic 4, transcript in Epic 6, suggestions in Epics 11/12). It already reads its
credentials from settings so the abstraction and configuration are in place.
"""
from __future__ import annotations

from typing import Any

from django.conf import settings

from .base import AIProvider


class GapGPTProvider(AIProvider):
    def __init__(self) -> None:
        self.api_key = settings.GAPGPT_API_KEY
        self.base_url = settings.GAPGPT_BASE_URL

    def generate_script(self, prompt: str) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 4: AI Script Assistant")

    def generate_transcript(self, audio_path: str) -> list[dict[str, Any]]:
        raise NotImplementedError("Implemented in Epic 6: Processing Pipeline")

    def suggest_color_profile(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 11: Light & Color")

    def suggest_music_track(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 12: Music")
