"""Authentication API views — phone + OTP, issuing JWT tokens.

Endpoints (docs/API.md):
    POST /auth/send-otp/   request an OTP for a phone number
    POST /auth/register/   verify OTP for a new account, return tokens
    POST /auth/login/      verify OTP for an existing account, return tokens
    GET  /auth/me/         current authenticated user
"""
from __future__ import annotations

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    SendOTPSerializer,
    UserSerializer,
)
from .services import generate_otp, send_otp_sms


def _tokens_for(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class SendOTPView(APIView):
    """Generate an OTP for a phone number and "send" it.

    The account row is created on first request so the OTP has somewhere to live;
    such a row stays unverified until the user completes registration.
    """

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone_number"]

        user, _ = User.objects.get_or_create(phone_number=phone)
        code = generate_otp()
        user.set_otp(code)
        user.save(update_fields=["otp_code", "otp_expires_at", "otp_attempts", "updated_at"])

        send_otp_sms(phone, code)

        payload = {"detail": "کد تأیید ارسال شد.", "expires_in": settings.OTP_TTL_SECONDS}
        if settings.OTP_DEBUG_RETURN:
            # Development convenience only — never enabled in production.
            payload["debug_otp"] = code
        return Response(payload, status=status.HTTP_200_OK)


class _VerifyOTPView(APIView):
    """Shared base for register/login: verify the OTP, then issue tokens."""

    permission_classes = [AllowAny]
    throttle_scope = "otp"
    serializer_class = None  # set by subclasses

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        user.is_verified = True
        user.clear_otp()
        user.save(update_fields=["is_verified", "otp_code", "otp_expires_at", "otp_attempts", "updated_at"])

        return Response(
            {"user": UserSerializer(user).data, **_tokens_for(user)},
            status=status.HTTP_200_OK,
        )


class RegisterView(_VerifyOTPView):
    serializer_class = RegisterSerializer


class LoginView(_VerifyOTPView):
    serializer_class = LoginSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
