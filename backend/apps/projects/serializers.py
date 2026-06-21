"""Serializers for projects."""
from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "title", "status", "created_at", "updated_at")
        # Status is driven by the backend state machine; only title is writable.
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("عنوان پروژه را وارد کنید.")
        return value
