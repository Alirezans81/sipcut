"""Processing + transcript API (Epics 6 & 7).

    POST  /projects/{id}/process/      start merge + transcript
    GET   /projects/{id}/processing/   status + timeline (source video + segments)
    GET   /projects/{id}/transcript/   read the transcript + segments
    PATCH /projects/{id}/transcript/   persist segment edits (text / deleted)
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project
from apps.projects.services import start_processing

from .models import Transcript
from .serializers import (
    ProcessingStatusSerializer,
    TranscriptSerializer,
    TranscriptUpdateSerializer,
)
from .services import apply_transcript_edits, build_timeline


class _ProjectScopedView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id) -> Project:
        # 404 (not 403) for projects the user doesn't own — don't leak existence.
        return get_object_or_404(Project, id=project_id, user=self.request.user)


class ProcessView(_ProjectScopedView):
    def post(self, request, project_id):
        project = self.get_project(project_id)
        start_processing(project)
        return Response(
            self._payload(request, project), status=status.HTTP_202_ACCEPTED
        )

    @staticmethod
    def _payload(request, project):
        return ProcessingStatusSerializer(
            {
                "status": project.status,
                "timeline": build_timeline(project, request),
            }
        ).data


class ProcessingStatusView(_ProjectScopedView):
    def get(self, request, project_id):
        project = self.get_project(project_id)
        return Response(ProcessView._payload(request, project))


class TranscriptView(_ProjectScopedView):
    """Read and edit a project's transcript — the source of truth for editing."""

    def get_transcript(self, project_id) -> Transcript:
        project = self.get_project(project_id)
        return get_object_or_404(Transcript, project=project)

    def get(self, request, project_id):
        transcript = self.get_transcript(project_id)
        return Response(TranscriptSerializer(transcript).data)

    def patch(self, request, project_id):
        transcript = self.get_transcript(project_id)
        serializer = TranscriptUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        apply_transcript_edits(transcript, serializer.validated_data["segments"])
        transcript.refresh_from_db()
        return Response(TranscriptSerializer(transcript).data)
