"""Video clip API — upload, list, rename, delete, reorder (docs/API.md).

    GET    /projects/{id}/videos/          list clips
    POST   /projects/{id}/videos/          upload a clip (multipart)
    POST   /projects/{id}/videos/reorder/  set clip order
    PATCH  /projects/{id}/videos/{pk}/     rename a clip
    DELETE /projects/{id}/videos/{pk}/     delete a clip
"""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.projects.models import Project

from .models import Video
from .serializers import ReorderSerializer, VideoSerializer, VideoUploadSerializer
from .services import create_video, reorder_videos


class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_project(self) -> Project:
        # 404 (not 403) for projects the user doesn't own.
        return get_object_or_404(
            Project, id=self.kwargs["project_id"], user=self.request.user
        )

    def get_queryset(self):
        return Video.objects.filter(project=self.get_project())

    def create(self, request, *args, **kwargs):
        project = self.get_project()
        upload = VideoUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        video = create_video(project, **upload.validated_data)
        return Response(
            VideoSerializer(video, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_destroy(self, instance: Video):
        # Remove the stored file too, then the row.
        instance.file.delete(save=False)
        instance.delete()

    @action(detail=False, methods=["post"])
    def reorder(self, request, project_id=None):
        project = self.get_project()
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reorder_videos(
            project, [str(v) for v in serializer.validated_data["video_ids"]]
        )
        videos = Video.objects.filter(project=project)
        return Response(
            VideoSerializer(
                videos, many=True, context=self.get_serializer_context()
            ).data
        )
