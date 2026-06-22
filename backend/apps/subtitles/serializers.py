"""Serializers for the subtitle API (Epic 10)."""
from __future__ import annotations

from rest_framework import serializers

from .presets import SUBTITLE_PRESETS


class GenerateSubtitleSerializer(serializers.Serializer):
    preset = serializers.ChoiceField(choices=list(SUBTITLE_PRESETS))
