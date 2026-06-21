"""Stub AI provider for local development and tests.

Returns deterministic, offline content so the full flow works without real API
credentials. The factory selects this automatically when no GapGPT key is set.
"""
from __future__ import annotations

from typing import Any

from .base import AIProvider


class StubProvider(AIProvider):
    def generate_script(self, prompt: str) -> dict[str, Any]:
        idea = (prompt or "").strip() or "موضوع شما"
        return {
            "title": f"۳ نکته درباره {idea}",
            "hook": "اگر این سه اشتباه را انجام می‌دهی، نتیجه نمی‌گیری!",
            "script": (
                f"در این ویدیو می‌خوام درباره «{idea}» صحبت کنم. "
                "اول یک نکته مهم می‌گم، بعد یک اشتباه رایج رو نشون می‌دم و "
                "در آخر یک راهکار ساده ارائه می‌دم که از همین امروز می‌تونی استفاده کنی."
            ),
            "shot_list": [
                "نمای رو به دوربین برای معرفی موضوع",
                "نمای نزدیک هنگام توضیح نکته اصلی",
                "نمای جمع‌بندی و دعوت به اکشن",
            ],
            "cta": "برای نکات بیشتر فالو کن و این ویدیو رو ذخیره کن.",
        }

    def generate_transcript(self, audio_path: str) -> list[dict[str, Any]]:
        raise NotImplementedError("Implemented in Epic 6: Processing Pipeline")

    def suggest_color_profile(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 11: Light & Color")

    def suggest_music_track(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Implemented in Epic 12: Music")
