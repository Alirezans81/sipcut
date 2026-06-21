"""Serializers for the phone + OTP authentication flow."""
from __future__ import annotations

from django.conf import settings
from rest_framework import serializers

from .models import User
from .services import normalize_phone


class UserSerializer(serializers.ModelSerializer):
    """Public representation of a user (used by /auth/me/)."""

    class Meta:
        model = User
        fields = ("id", "phone_number", "is_verified", "created_at")
        read_only_fields = fields


class SendOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField()

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone(value)


class VerifyOTPSerializer(serializers.Serializer):
    """Validates a phone + OTP pair.

    Shared by register and login. Subclasses set ``require_verified`` to enforce
    the account state appropriate to the endpoint and expose the resolved user as
    ``self.user`` after ``is_valid()``.
    """

    phone_number = serializers.CharField()
    otp_code = serializers.CharField()

    # None = don't care; True = must already be verified (login);
    # False = must NOT be verified yet (register).
    require_verified: bool | None = None

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone(value)

    def validate(self, attrs: dict) -> dict:
        phone = attrs["phone_number"]
        code = attrs["otp_code"]

        try:
            user = User.objects.get(phone_number=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError("کد تأیید نامعتبر است.")

        if self.require_verified is True and not user.is_verified:
            raise serializers.ValidationError(
                "حساب کاربری یافت نشد. لطفاً ابتدا ثبت‌نام کنید."
            )
        if self.require_verified is False and user.is_verified:
            raise serializers.ValidationError(
                "این شماره قبلاً ثبت‌نام کرده است. لطفاً وارد شوید."
            )

        if not user.otp_code or user.otp_is_expired:
            raise serializers.ValidationError("کد تأیید منقضی شده است.")

        if user.otp_attempts >= settings.OTP_MAX_ATTEMPTS:
            raise serializers.ValidationError(
                "تعداد تلاش‌ها بیش از حد مجاز است. کد جدید درخواست کنید."
            )

        if code != user.otp_code:
            # Count the failed attempt against the active OTP.
            user.otp_attempts += 1
            user.save(update_fields=["otp_attempts", "updated_at"])
            raise serializers.ValidationError("کد تأیید نادرست است.")

        self.user = user
        return attrs


class RegisterSerializer(VerifyOTPSerializer):
    require_verified = False


class LoginSerializer(VerifyOTPSerializer):
    require_verified = True
