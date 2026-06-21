"""Project API — owner-scoped CRUD (docs/API.md).

Exposes create, list, retrieve and delete. Update is intentionally omitted: a
project's title is set at creation and its status is managed by the backend
pipeline, not edited directly by clients.
"""
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users may only ever see and act on their own projects.
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
