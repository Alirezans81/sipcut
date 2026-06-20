"""Root URL configuration for SipCut.

All public API routes are mounted under ``/api/v1/`` (see docs/API.md). App-level
route modules are added as each epic is implemented.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    """Lightweight liveness probe used by the frontend and orchestration."""
    return JsonResponse({"status": "ok"})


api_v1_patterns = [
    path("health/", health, name="health"),
    # Epic 2+ route modules are mounted here, e.g.:
    # path("auth/", include("apps.accounts.urls")),
    # path("projects/", include("apps.projects.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((api_v1_patterns, "api"), namespace="v1")),
]
