"""Processing API — trigger the pipeline and read its progress (Epic 6).

    POST /projects/{id}/process/      start merge + transcript
    GET  /projects/{id}/processing/   status + timeline (source video + segments)
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project
from apps.projects.services import start_processing

from .serializers import ProcessingStatusSerializer
from .services import build_timeline


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
