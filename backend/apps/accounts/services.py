"""Phone + OTP helpers for the authentication flow.

SMS delivery is abstracted behind :func:`send_otp_sms`. In development there is no
SMS gateway, so the code is logged (and, when ``OTP_DEBUG_RETURN`` is on, returned
by the API). Wiring a real provider later means changing only this function.
"""
from __future__ import annotations

import logging
import re
import secrets

from django.conf import settings
from rest_framework import serializers

logger = logging.getLogger(__name__)

# Iranian mobile numbers, normalized to E.164: +989XXXXXXXXX.
_NORMALIZED_RE = re.compile(r"^9\d{9}$")


def normalize_phone(raw: str) -> str:
    """Normalize a user-entered Iranian mobile number to ``+989XXXXXXXXX``.

    Accepts common formats: ``09123456789``, ``9123456789``, ``+989123456789``,
    ``00989123456789``. Raises ``ValidationError`` on anything else.
    """
    digits = re.sub(r"\D", "", raw or "")

    if digits.startswith("0098"):
        digits = digits[4:]
    elif digits.startswith("98"):
        digits = digits[2:]
    elif digits.startswith("0"):
        digits = digits[1:]

    if not _NORMALIZED_RE.match(digits):
        raise serializers.ValidationError("شماره موبایل معتبر نیست.")

    return f"+98{digits}"


def generate_otp() -> str:
    """Return a cryptographically-random numeric OTP of the configured length."""
    length = settings.OTP_LENGTH
    return "".join(secrets.choice("0123456789") for _ in range(length))


def send_otp_sms(phone_number: str, code: str) -> None:
    """Deliver the OTP to the user.

    Replace the body with a real SMS provider call in production. For now it logs
    so the flow is observable during development.
    """
    logger.info("OTP for %s: %s", phone_number, code)
