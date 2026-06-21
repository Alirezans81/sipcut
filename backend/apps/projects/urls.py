"""Project routes, mounted under /api/v1/ (docs/API.md)."""
from rest_framework.routers import SimpleRouter

from .views import ProjectViewSet

app_name = "projects"

router = SimpleRouter()
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = router.urls
