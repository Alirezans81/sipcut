"""Serializers for the processing pipeline output (Epic 6)."""
from __future__ import annotations

from rest_framework import serializers


class TranscriptSegmentSerializer(serializers.Serializer):
    id = serializers.CharField()
    text = serializers.CharField()
    start_time = serializers.FloatField()
    end_time = serializers.FloatField()
    deleted = serializers.BooleanField()
    order = serializers.IntegerField()


class SourceVideoSerializer(serializers.Serializer):
    url = serializers.CharField()
    duration = serializers.FloatField()


class TimelineSerializer(serializers.Serializer):
    duration = serializers.FloatField()
    source_video = SourceVideoSerializer(allow_null=True)
    segments = TranscriptSegmentSerializer(many=True)


class ProcessingStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    timeline = TimelineSerializer()
