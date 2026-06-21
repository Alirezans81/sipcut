"""Video clip routes, nested under a project (docs/API.md)."""
from django.urls import path

from .views import VideoViewSet

app_name = "videos"

list_create = VideoViewSet.as_view({"get": "list", "post": "create"})
reorder = VideoViewSet.as_view({"post": "reorder"})
detail = VideoViewSet.as_view({"patch": "partial_update", "delete": "destroy"})

urlpatterns = [
    path("projects/<uuid:project_id>/videos/", list_create, name="video-list"),
    path(
        "projects/<uuid:project_id>/videos/reorder/",
        reorder,
        name="video-reorder",
    ),
    path(
        "projects/<uuid:project_id>/videos/<uuid:pk>/",
        detail,
        name="video-detail",
    ),
]
