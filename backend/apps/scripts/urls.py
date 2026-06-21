"""Script routes, nested under a project (docs/API.md)."""
from django.urls import path

from .views import GenerateScriptView, ScriptView

app_name = "scripts"

urlpatterns = [
    path(
        "projects/<uuid:project_id>/script/",
        ScriptView.as_view(),
        name="script",
    ),
    path(
        "projects/<uuid:project_id>/script/generate/",
        GenerateScriptView.as_view(),
        name="script-generate",
    ),
]
