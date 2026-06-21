"""Serializers for scripts."""
from rest_framework import serializers

from .models import Script


class ScriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Script
        fields = (
            "id",
            "title",
            "hook",
            "script",
            "shot_list",
            "cta",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class GenerateScriptSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=2000)

    def validate_prompt(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("ایده خود را بنویسید.")
        return value
