"""Tests for the phone + OTP authentication flow."""
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.throttling import ScopedRateThrottle

from .models import User
from .services import normalize_phone


class NormalizePhoneTests(APITestCase):
    def test_accepts_common_formats(self):
        for raw in ["09123456789", "9123456789", "+989123456789", "00989123456789"]:
            self.assertEqual(normalize_phone(raw), "+989123456789")

    def test_rejects_invalid(self):
        from rest_framework.serializers import ValidationError

        for raw in ["123", "0812345678", "callme", ""]:
            with self.assertRaises(ValidationError):
                normalize_phone(raw)


@override_settings(OTP_DEBUG_RETURN=True)
class AuthFlowTests(APITestCase):
    PHONE = "09123456789"
    NORMALIZED = "+989123456789"

    def setUp(self):
        # DRF binds throttle rates at import time, so settings overrides can't
        # reach them — null the "otp" scope directly and start with a clean cache.
        cache.clear()
        self._orig_rates = ScopedRateThrottle.THROTTLE_RATES
        ScopedRateThrottle.THROTTLE_RATES = {**self._orig_rates, "otp": None}

    def tearDown(self):
        ScopedRateThrottle.THROTTLE_RATES = self._orig_rates
        cache.clear()

    def _send_otp(self):
        res = self.client.post(reverse("v1:accounts:send-otp"), {"phone_number": self.PHONE})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        return res.data["debug_otp"]

    def test_send_otp_creates_unverified_user(self):
        self._send_otp()
        user = User.objects.get(phone_number=self.NORMALIZED)
        self.assertFalse(user.is_verified)
        self.assertTrue(user.otp_code)

    def test_register_then_login(self):
        # Register with the issued OTP.
        code = self._send_otp()
        res = self.client.post(
            reverse("v1:accounts:register"),
            {"phone_number": self.PHONE, "otp_code": code},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        user = User.objects.get(phone_number=self.NORMALIZED)
        self.assertTrue(user.is_verified)
        self.assertEqual(user.otp_code, "")  # cleared after use

        # Registering again is rejected.
        code = self._send_otp()
        res = self.client.post(
            reverse("v1:accounts:register"),
            {"phone_number": self.PHONE, "otp_code": code},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # But login succeeds.
        code = self._send_otp()
        res = self.client.post(
            reverse("v1:accounts:login"),
            {"phone_number": self.PHONE, "otp_code": code},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.access = res.data["access"]

    def test_login_unknown_user_rejected(self):
        # send-otp creates the row but login requires a verified account.
        code = self._send_otp()
        res = self.client.post(
            reverse("v1:accounts:login"),
            {"phone_number": self.PHONE, "otp_code": code},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wrong_otp_rejected(self):
        self._send_otp()
        res = self.client.post(
            reverse("v1:accounts:register"),
            {"phone_number": self.PHONE, "otp_code": "000000"},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_auth(self):
        res = self.client.get(reverse("v1:accounts:me"))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        code = self._send_otp()
        reg = self.client.post(
            reverse("v1:accounts:register"),
            {"phone_number": self.PHONE, "otp_code": code},
        )
        token = reg.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(reverse("v1:accounts:me"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["phone_number"], self.NORMALIZED)
