"""Custom user model.

Keyed on ``phone_number`` with OTP fields, matching docs/DATABASE.md. The
authentication flow itself (send/verify OTP, JWT issuance) is implemented in
Epic 2 — this model only establishes the schema so ``AUTH_USER_MODEL`` is correct
from the project's first migration.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(max_length=20, unique=True)

    # One-time-password fields used by the phone-based auth flow (Epic 2).
    otp_code = models.CharField(max_length=6, blank=True, default="")
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.PositiveSmallIntegerField(default=0)

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
