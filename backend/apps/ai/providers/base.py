"""Abstract AI provider interface.

Concrete providers (GapGPT today; OpenAI / Anthropic / Gemini later) implement
this interface so application logic never changes when the provider does.
"""
from __future__ import annotations

import abc
from typing import Any


class AIProvider(abc.ABC):
    """Interface every AI provider must satisfy."""

    @abc.abstractmethod
    def generate_script(self, prompt: str) -> dict[str, Any]:
        """Return a structured script: title, hook, script, shotList, cta."""

    @abc.abstractmethod
    def generate_transcript(self, audio_path: str) -> list[dict[str, Any]]:
        """Return transcript segments: text, start, end."""

    @abc.abstractmethod
    def suggest_color_profile(self, context: dict[str, Any]) -> dict[str, Any]:
        """Suggest one light/color setup from transcript and rhythm context."""

    @abc.abstractmethod
    def suggest_music_track(self, context: dict[str, Any]) -> dict[str, Any]:
        """Suggest one background track from transcript and energy context."""
