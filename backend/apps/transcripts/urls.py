"""Processing pipeline routes, nested under a project (docs/API.md)."""
from django.urls import path

from .views import ProcessingStatusView, ProcessView

app_name = "transcripts"

urlpatterns = [
    path(
        "projects/<uuid:project_id>/process/",
        ProcessView.as_view(),
        name="process",
    ),
    path(
        "projects/<uuid:project_id>/processing/",
        ProcessingStatusView.as_view(),
        name="processing-status",
    ),
]
