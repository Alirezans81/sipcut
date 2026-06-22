"""Transcript generation and timeline assembly (Epic 6).

The transcript is produced from the project's merged source video and becomes the
source of truth for editing. ``build_timeline`` assembles the read model that the
editor and timeline UI consume (source video + ordered segments).
"""
from __future__ import annotations

import os
import tempfile

from rest_framework import serializers

from apps.ai.providers.factory import get_provider
from apps.common import ffmpeg
from apps.projects.models import Project

from .models import Transcript, TranscriptSegment


def generate_project_transcript(project: Project) -> Transcript:
    """Transcribe the project's source video and store the segments.

    Regenerating replaces any existing transcript for the project (Epic 6).
    """
    source = getattr(project, "source_video", None)
    if source is None or not source.file:
        raise serializers.ValidationError("ابتدا باید ویدیوی منبع ساخته شود.")

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    try:
        ffmpeg.extract_audio(source.file.path, tmp.name)
        segments = get_provider().generate_transcript(tmp.name)
    finally:
        os.unlink(tmp.name)

    Transcript.objects.filter(project=project).delete()
    transcript = Transcript.objects.create(project=project)
    TranscriptSegment.objects.bulk_create(
        [
            TranscriptSegment(
                transcript=transcript,
                text=str(seg.get("text", "")).strip(),
                start_time=float(seg.get("start", 0) or 0),
                end_time=float(seg.get("end", 0) or 0),
                order=index,
            )
            for index, seg in enumerate(segments)
        ]
    )
    return transcript


def apply_transcript_edits(transcript: Transcript, edits: list[dict]) -> Transcript:
    """Persist text/deleted changes to a transcript's segments (Epic 7).

    Edits are keyed by segment id; ids that don't belong to this transcript are
    ignored. Only fields present in each edit are touched, and only when they
    actually change — keeping ``updated_at`` meaningful.
    """
    segments = {str(s.id): s for s in transcript.segments.all()}
    for edit in edits:
        segment = segments.get(str(edit["id"]))
        if segment is None:
            continue
        changed: list[str] = []
        if "text" in edit and segment.text != edit["text"]:
            segment.text = edit["text"]
            changed.append("text")
        if "deleted" in edit and segment.deleted != edit["deleted"]:
            segment.deleted = edit["deleted"]
            changed.append("deleted")
        if changed:
            segment.save(update_fields=changed + ["updated_at"])
    return transcript


def build_timeline(project: Project, request=None) -> dict:
    """Assemble timeline data: the source video plus its ordered segments.

    Segments keep their ``deleted`` flag so the timeline can render cut markers
    (Epic 8) without losing the original material.
    """
    source = getattr(project, "source_video", None)
    transcript = getattr(project, "transcript", None)

    source_data = None
    if source is not None and source.file:
        url = source.file.url
        if request is not None:
            url = request.build_absolute_uri(url)
        source_data = {"url": url, "duration": source.duration}

    segments = []
    if transcript is not None:
        segments = [
            {
                "id": str(seg.id),
                "text": seg.text,
                "start_time": seg.start_time,
                "end_time": seg.end_time,
                "deleted": seg.deleted,
                "order": seg.order,
            }
            for seg in transcript.segments.all()
        ]

    return {
        "duration": source_data["duration"] if source_data else 0,
        "source_video": source_data,
        "segments": segments,
    }
