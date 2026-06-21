"""Custom user model.

Keyed on ``phone_number`` with OTP fields, matching docs/DATABASE.md. Phone +
one-time-password authentication is implemented in Epic 2.

``is_verified`` is a small addition to the documented schema: an account row is
created the moment an OTP is requested (so the code has somewhere to live), and
this flag marks accounts that have completed at least one verification. It lets
register (must be unverified) and login (must be verified) stay distinct.
"""
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(max_length=20, unique=True)

    # One-time-password fields used by the phone-based auth flow.
    otp_code = models.CharField(max_length=8, blank=True, default="")
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.PositiveSmallIntegerField(default=0)

    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.phone_number

    # -- OTP helpers ---------------------------------------------------------

    def set_otp(self, code: str) -> None:
        """Store a freshly generated OTP and (re)start its TTL / attempt count."""
        self.otp_code = code
        self.otp_expires_at = timezone.now() + timedelta(
            seconds=settings.OTP_TTL_SECONDS
        )
        self.otp_attempts = 0

    def clear_otp(self) -> None:
        self.otp_code = ""
        self.otp_expires_at = None
        self.otp_attempts = 0

    @property
    def otp_is_expired(self) -> bool:
        return self.otp_expires_at is None or timezone.now() > self.otp_expires_at
