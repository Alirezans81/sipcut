"""Subtitle routes, nested under a project (docs/API.md)."""
from django.urls import path

from .views import GenerateSubtitleView, SubtitleView

app_name = "subtitles"

urlpatterns = [
    path(
        "projects/<uuid:project_id>/subtitles/",
        SubtitleView.as_view(),
        name="subtitles",
    ),
    path(
        "projects/<uuid:project_id>/subtitles/generate/",
        GenerateSubtitleView.as_view(),
        name="subtitles-generate",
    ),
]
