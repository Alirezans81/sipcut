"""Serializers for the auto-cleanup API (Epic 9)."""
from __future__ import annotations

from rest_framework import serializers

from .models import CleanupOperation


class CleanupOperationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = CleanupOperation
        fields = ["id", "type", "start_time", "end_time", "created_at"]


class CleanupSummarySerializer(serializers.Serializer):
    silence_count = serializers.IntegerField()
    breath_count = serializers.IntegerField()
    total_seconds = serializers.FloatField()


class CleanupStateSerializer(serializers.Serializer):
    operations = CleanupOperationSerializer(many=True)
    summary = CleanupSummarySerializer()
