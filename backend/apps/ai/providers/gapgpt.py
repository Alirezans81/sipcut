"""GapGPT provider — the current default AI backend.

GapGPT exposes an OpenAI-compatible API, so this talks to ``/chat/completions``
with the configured key. Methods for later epics (transcript, suggestions) are
still stubs and raise ``NotImplementedError``.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import requests
from django.conf import settings

from .base import AIProvider

logger = logging.getLogger(__name__)

SCRIPT_SYSTEM_PROMPT = (
    "You are a scriptwriting assistant for Persian-speaking Instagram creators. "
    "Given the user's idea, produce a short-form reel script in Persian (Farsi). "
    "Respond ONLY with a JSON object using exactly these keys: "
    "title (string), hook (string), script (string), "
    "shot_list (array of strings), cta (string). "
    "Keep it concise, energetic, and ready to record."
)


class AIProviderError(Exception):
    """Raised when the upstream AI provider fails."""


class GapGPTProvider(AIProvider):
    def __init__(self) -> None:
        self.api_key = settings.GAPGPT_API_KEY
        self.base_url = settings.GAPGPT_BASE_URL.rstrip("/")
        self.model = settings.GAPGPT_MODEL
        self.timeout = settings.AI_TIMEOUT

    def generate_script(self, prompt: str) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SCRIPT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.8,
        }
        try:
            resp = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
        except (requests.RequestException, KeyError, ValueError) as exc:
            logger.exception("GapGPT script generation failed")
            raise AIProviderError("تولید اسکریپت با خطا مواجه شد.") from exc

        return _normalize_script(data)

    def generate_transcript(self, audio_path: str) -> list[dict[str, Any]]:
        # GapGPT is OpenAI-compatible, so use the Whisper transcription endpoint
        # with verbose_json to get per-segment timestamps.
        try:
            with open(audio_path, "rb") as audio:
                resp = requests.post(
                    f"{self.base_url}/audio/transcriptions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files={"file": (Path(audio_path).name, audio, "audio/wav")},
                    data={
                        "model": settings.GAPGPT_TRANSCRIBE_MODEL,
                        "response_format": "verbose_json",
                        "language": "fa",
                    },
                    timeout=self.timeout,
                )
            resp.raise_for_status()
            data = resp.json()
        except (requests.RequestException, ValueError) as exc:
            logger.exception("GapGPT transcription failed")
            raise AIProviderError("تولید متن گفتار با خطا مواجه شد.") from exc

        return _normalize_segments(data)

    def suggest_color_profile(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 11: Light & Color")

    def suggest_music_track(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 12: Music")


def _normalize_script(data: dict[str, Any]) -> dict[str, Any]:
    """Coerce a model response into the provider contract, tolerating variants."""
    shot_list = data.get("shot_list") or data.get("shotList") or []
    if isinstance(shot_list, str):
        shot_list = [shot_list]
    return {
        "title": str(data.get("title", "")).strip(),
        "hook": str(data.get("hook", "")).strip(),
        "script": str(data.get("script", "")).strip(),
        "shot_list": [str(s).strip() for s in shot_list if str(s).strip()],
        "cta": str(data.get("cta", "")).strip(),
    }


def _normalize_segments(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Coerce a Whisper ``verbose_json`` response into our segment contract."""
    segments = data.get("segments") or []
    normalized: list[dict[str, Any]] = []
    for seg in segments:
        text = str(seg.get("text", "")).strip()
        if not text:
            continue
        normalized.append(
            {
                "text": text,
                "start": float(seg.get("start", 0) or 0),
                "end": float(seg.get("end", 0) or 0),
            }
        )
    return normalized
