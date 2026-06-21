"""Script API — generate and retrieve a project's script (docs/API.md).

    POST /projects/{id}/script/generate/   { prompt }
    GET  /projects/{id}/script/
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.providers.gapgpt import AIProviderError
from apps.projects.models import Project

from .models import Script
from .serializers import GenerateScriptSerializer, ScriptSerializer
from .services import generate_script_for_project


class AIUnavailable(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "سرویس هوش مصنوعی در دسترس نیست."
    default_code = "ai_unavailable"


class _ProjectScopedView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id) -> Project:
        # 404 (not 403) for projects the user doesn't own — don't leak existence.
        return get_object_or_404(Project, id=project_id, user=self.request.user)


class ScriptView(_ProjectScopedView):
    def get(self, request, project_id):
        project = self.get_project(project_id)
        script = get_object_or_404(Script, project=project)
        return Response(ScriptSerializer(script).data)


class GenerateScriptView(_ProjectScopedView):
    def post(self, request, project_id):
        project = self.get_project(project_id)

        serializer = GenerateScriptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            script = generate_script_for_project(
                project, serializer.validated_data["prompt"]
            )
        except AIProviderError as exc:
            raise AIUnavailable(str(exc)) from exc

        return Response(ScriptSerializer(script).data, status=status.HTTP_201_CREATED)
