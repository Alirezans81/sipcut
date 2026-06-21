"""Clip storage and ordering helpers."""
from __future__ import annotations

from rest_framework import serializers

from apps.projects.models import Project

from .models import Video


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
