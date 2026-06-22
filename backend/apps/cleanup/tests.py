"""Tests for the auto-cleanup API (Epic 9). FFmpeg detection is mocked."""
import shutil
import tempfile
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.projects.models import Project
from apps.videos.models import SourceVideo

from .models import CleanupOperation

User = get_user_model()

MEDIA_ROOT = tempfile.mkdtemp()

# 0.4s breath, 1.2s silence, 0.3s breath (against the default 0.6/0.25 thresholds).
REGIONS = [
    {"start": 1.0, "end": 1.4},
    {"start": 3.0, "end": 4.2},
    {"start": 6.0, "end": 6.3},
]


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class CleanupAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.project = Project.objects.create(user=self.user, title="Reel")
        SourceVideo.objects.create(
            project=self.project,
            file=SimpleUploadedFile("source.mp4", b"x", content_type="video/mp4"),
            duration=8.0,
        )
        self.client.force_authenticate(self.user)

    def _url(self, name, pid=None):
        return reverse(f"v1:cleanup:{name}", args=[pid or self.project.id])

    def _patch(self):
        return mock.patch("apps.common.ffmpeg.detect_silences", return_value=REGIONS)

    def test_remove_silence_keeps_only_long_gaps(self):
        with self._patch():
            res = self.client.post(self._url("cleanup-silence"))
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["summary"]["silence_count"], 1)
        self.assertEqual(res.data["summary"]["breath_count"], 0)
        self.assertAlmostEqual(res.data["summary"]["total_seconds"], 1.2, places=2)

    def test_remove_breaths_keeps_only_short_gaps(self):
        with self._patch():
            res = self.client.post(self._url("cleanup-breaths"))
        self.assertEqual(res.data["summary"]["breath_count"], 2)
        self.assertEqual(res.data["summary"]["silence_count"], 0)
        self.assertAlmostEqual(res.data["summary"]["total_seconds"], 0.7, places=2)

    def test_silence_and_breath_combine(self):
        with self._patch():
            self.client.post(self._url("cleanup-silence"))
            self.client.post(self._url("cleanup-breaths"))
        res = self.client.get(self._url("cleanup"))
        self.assertEqual(res.data["summary"]["silence_count"], 1)
        self.assertEqual(res.data["summary"]["breath_count"], 2)
        self.assertAlmostEqual(res.data["summary"]["total_seconds"], 1.9, places=2)

    def test_rerun_replaces_same_type(self):
        with self._patch():
            self.client.post(self._url("cleanup-silence"))
            self.client.post(self._url("cleanup-silence"))
        self.assertEqual(
            CleanupOperation.objects.filter(
                project=self.project, type="silence"
            ).count(),
            1,
        )

    def test_delete_clears_all(self):
        with self._patch():
            self.client.post(self._url("cleanup-silence"))
            self.client.post(self._url("cleanup-breaths"))
        res = self.client.delete(self._url("cleanup"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["summary"]["total_seconds"], 0)
        self.assertFalse(
            CleanupOperation.objects.filter(project=self.project).exists()
        )

    def test_requires_source_video(self):
        empty = Project.objects.create(user=self.user, title="No source")
        with self._patch():
            res = self.client.post(
                reverse("v1:cleanup:cleanup-silence", args=[empty.id])
            )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_cleanup_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        res = self.client.post(reverse("v1:cleanup:cleanup-silence", args=[theirs.id]))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(
            self.client.get(self._url("cleanup")).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
