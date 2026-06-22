"""Subtitle API (Epic 10 / docs/API.md).

    GET  /projects/{id}/subtitles/           available presets + current track
    POST /projects/{id}/subtitles/generate/  { preset }  generate the track
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project

from .presets import SUBTITLE_PRESETS, all_presets, preset_style
from .serializers import GenerateSubtitleSerializer
from .services import generate_subtitles


def subtitle_payload(project: Project, request) -> dict:
    """Available presets plus the project's current subtitle (or null)."""
    subtitle = getattr(project, "subtitle", None)
    data = None
    if subtitle is not None and subtitle.preset in SUBTITLE_PRESETS:
        url = None
        if subtitle.file:
            url = request.build_absolute_uri(subtitle.file.url)
        data = {
            "preset": subtitle.preset,
            "style": preset_style(subtitle.preset),
            "url": url,
            "created_at": subtitle.created_at.isoformat(),
        }
    return {"presets": all_presets(), "subtitle": data}


class _ProjectScopedView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id) -> Project:
        # 404 (not 403) for projects the user doesn't own — don't leak existence.
        return get_object_or_404(Project, id=project_id, user=self.request.user)


class SubtitleView(_ProjectScopedView):
    def get(self, request, project_id):
        project = self.get_project(project_id)
        return Response(subtitle_payload(project, request))


class GenerateSubtitleView(_ProjectScopedView):
    def post(self, request, project_id):
        project = self.get_project(project_id)
        serializer = GenerateSubtitleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        generate_subtitles(project, serializer.validated_data["preset"])
        return Response(
            subtitle_payload(project, request), status=status.HTTP_201_CREATED
        )
