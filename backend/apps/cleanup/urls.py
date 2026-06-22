"""Auto-cleanup routes, nested under a project (docs/API.md)."""
from django.urls import path

from .views import CleanupView, RemoveBreathsView, RemoveSilenceView

app_name = "cleanup"

urlpatterns = [
    path(
        "projects/<uuid:project_id>/cleanup/",
        CleanupView.as_view(),
        name="cleanup",
    ),
    path(
        "projects/<uuid:project_id>/cleanup/silence/",
        RemoveSilenceView.as_view(),
        name="cleanup-silence",
    ),
    path(
        "projects/<uuid:project_id>/cleanup/breaths/",
        RemoveBreathsView.as_view(),
        name="cleanup-breaths",
    ),
]
