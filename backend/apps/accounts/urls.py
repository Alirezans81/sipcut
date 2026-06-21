"""Authentication routes, mounted under /api/v1/auth/ (docs/API.md)."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, MeView, RegisterView, SendOTPView

app_name = "accounts"

urlpatterns = [
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    # Used by the frontend API client to transparently refresh access tokens.
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
