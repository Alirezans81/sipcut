"""Serializers for the processing pipeline output (Epic 6) and the transcript
editor (Epic 7)."""
from __future__ import annotations

from rest_framework import serializers

from .models import Transcript, TranscriptSegment


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


# --- Transcript editor (Epic 7) -------------------------------------------
class SegmentSerializer(serializers.ModelSerializer):
    """Read representation of a transcript segment."""

    id = serializers.CharField(read_only=True)

    class Meta:
        model = TranscriptSegment
        fields = ["id", "text", "start_time", "end_time", "deleted", "order"]


class TranscriptSerializer(serializers.ModelSerializer):
    segments = SegmentSerializer(many=True, read_only=True)

    class Meta:
        model = Transcript
        fields = ["id", "created_at", "segments"]


class SegmentEditSerializer(serializers.Serializer):
    """A single segment change — only ``text`` and ``deleted`` are editable.

    Timing and order come from the source video and never change here; edits are
    non-destructive (a deleted segment is hidden, not removed).
    """

    id = serializers.UUIDField()
    text = serializers.CharField(required=False, allow_blank=True)
    deleted = serializers.BooleanField(required=False)


class TranscriptUpdateSerializer(serializers.Serializer):
    segments = SegmentEditSerializer(many=True)
