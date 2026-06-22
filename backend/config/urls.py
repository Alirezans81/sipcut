"""Root URL configuration for SipCut.

All public API routes are mounted under ``/api/v1/`` (see docs/API.md). App-level
route modules are added as each epic is implemented.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    """Lightweight liveness probe used by the frontend and orchestration."""
    return JsonResponse({"status": "ok"})


api_v1_patterns = [
    path("health/", health, name="health"),
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.projects.urls")),
    path("", include("apps.scripts.urls")),
    path("", include("apps.videos.urls")),
    path("", include("apps.transcripts.urls")),
    path("", include("apps.cleanup.urls")),
    # Epic 10+ route modules are mounted here.
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((api_v1_patterns, "api"), namespace="v1")),
]

# Serve user-uploaded media from local disk in development (S3 serves it in prod).
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
