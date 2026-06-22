"""Clip storage, ordering, and merge helpers."""
from __future__ import annotations

import os
import tempfile

from django.core.files import File
from rest_framework import serializers

from apps.common import ffmpeg
from apps.projects.models import Project

from .models import SourceVideo, Video


def create_video(project: Project, file, name: str = "", duration: float = 0) -> Video:
    """Store an uploaded clip and append it to the end of the project's order."""
    last = project.videos.order_by("-order").first()
    next_order = (last.order + 1) if last else 0
    return Video.objects.create(
        project=project,
        file=file,
        name=(name or "").strip() or file.name,
        duration=duration,
        order=next_order,
    )


def reorder_videos(project: Project, video_ids: list[str]) -> None:
    """Apply a new clip order. ``video_ids`` must be a permutation of the project's
    clips (same set, desired sequence)."""
    videos = {str(v.id): v for v in project.videos.all()}
    if {str(v) for v in video_ids} != set(videos):
        raise serializers.ValidationError(
            "لیست ارسالی باید دقیقاً شامل همه کلیپ‌های پروژه باشد."
        )

    for index, vid in enumerate(video_ids):
        video = videos[str(vid)]
        if video.order != index:
            video.order = index
            video.save(update_fields=["order", "updated_at"])


def merge_project_clips(project: Project) -> SourceVideo:
    """Merge a project's ordered clips into a single normalized source video.

    Regenerating replaces the project's existing :class:`SourceVideo` file in
    place. Returns the saved source video (Epic 6).
    """
    clips = list(project.videos.all())
    if not clips:
        raise serializers.ValidationError("پروژه هیچ کلیپی برای ادغام ندارد.")

    inputs = [clip.file.path for clip in clips]  # local disk in dev; S3 needs sync
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp.close()
    try:
        ffmpeg.merge_videos(inputs, tmp.name)
        duration = ffmpeg.probe_duration(tmp.name)

        source, _ = SourceVideo.objects.get_or_create(project=project)
        source.file.delete(save=False)  # drop the previous merge, if any
        with open(tmp.name, "rb") as fh:
            source.file.save("source.mp4", File(fh), save=False)
        source.duration = duration
        source.save()
    finally:
        os.unlink(tmp.name)

    return source
