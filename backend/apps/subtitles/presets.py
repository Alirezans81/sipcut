"""Subtitle style presets (Epic 10).

These are the authoritative subtitle styles, shared by the live preview (rendered
as CSS in the browser) and the final burn-in at export (Epic 13). ``font_size`` is
expressed in ``cqw`` (container-query width units) so captions scale with the 9:16
preview frame at any size. Presets mirror docs/USER_JOURNEY.md — Clean, Bold, Reels.
"""
from __future__ import annotations

SUBTITLE_PRESETS: dict[str, dict] = {
    "clean": {
        "label": "تمیز",
        "font_size": 6.0,
        "font_weight": 600,
        "text_color": "#ffffff",
        "outline_color": "rgba(0,0,0,0.85)",
        "background": "transparent",
        "position": "bottom",
    },
    "bold": {
        "label": "پررنگ",
        "font_size": 7.0,
        "font_weight": 800,
        "text_color": "#ffffff",
        "outline_color": "#000000",
        "background": "rgba(0,0,0,0.6)",
        "position": "bottom",
    },
    "reels": {
        "label": "ریلز",
        "font_size": 7.5,
        "font_weight": 800,
        "text_color": "#fde047",
        "outline_color": "#000000",
        "background": "transparent",
        "position": "center",
    },
}

DEFAULT_PRESET = "reels"


def preset_style(name: str) -> dict:
    """Return the style dict for ``name`` including its key."""
    return {"preset": name, **SUBTITLE_PRESETS[name]}


def all_presets() -> list[dict]:
    return [preset_style(name) for name in SUBTITLE_PRESETS]
