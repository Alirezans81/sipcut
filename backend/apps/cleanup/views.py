"""Auto-cleanup API (Epic 9 / docs/API.md).

    GET    /projects/{id}/cleanup/           current cleanup state
    DELETE /projects/{id}/cleanup/           undo all cleanup
    POST   /projects/{id}/cleanup/silence/   detect + apply silence cuts
    POST   /projects/{id}/cleanup/breaths/   detect + apply breath cuts
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project

from .models import CleanupOperation
from .serializers import CleanupStateSerializer
from .services import clear_cleanup, cleanup_summary, detect_cleanup


def cleanup_state(project: Project) -> dict:
    return {
        "operations": list(project.cleanup_operations.all()),
        "summary": cleanup_summary(project),
    }


class _ProjectScopedView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id) -> Project:
        # 404 (not 403) for projects the user doesn't own — don't leak existence.
        return get_object_or_404(Project, id=project_id, user=self.request.user)


class CleanupView(_ProjectScopedView):
    def get(self, request, project_id):
        project = self.get_project(project_id)
        return Response(CleanupStateSerializer(cleanup_state(project)).data)

    def delete(self, request, project_id):
        project = self.get_project(project_id)
        clear_cleanup(project)
        return Response(CleanupStateSerializer(cleanup_state(project)).data)


class _DetectView(_ProjectScopedView):
    kind: str

    def post(self, request, project_id):
        project = self.get_project(project_id)
        detect_cleanup(project, self.kind)
        return Response(
            CleanupStateSerializer(cleanup_state(project)).data,
            status=status.HTTP_201_CREATED,
        )


class RemoveSilenceView(_DetectView):
    kind = CleanupOperation.Kind.SILENCE


class RemoveBreathsView(_DetectView):
    kind = CleanupOperation.Kind.BREATH
