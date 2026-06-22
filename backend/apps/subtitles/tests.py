"""Tests for the subtitle API (Epic 10)."""
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.projects.models import Project
from apps.transcripts.models import Transcript, TranscriptSegment

from .models import Subtitle

User = get_user_model()

MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class SubtitleAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.project = Project.objects.create(user=self.user, title="Reel")
        self.transcript = Transcript.objects.create(project=self.project)
        TranscriptSegment.objects.create(
            transcript=self.transcript, text="جمله اول", start_time=0, end_time=3, order=0
        )
        TranscriptSegment.objects.create(
            transcript=self.transcript, text="حذف‌شده", start_time=3, end_time=6,
            order=1, deleted=True,
        )
        TranscriptSegment.objects.create(
            transcript=self.transcript, text="جمله سوم", start_time=6, end_time=9, order=2
        )
        self.client.force_authenticate(self.user)

    def _list_url(self, pid=None):
        return reverse("v1:subtitles:subtitles", args=[pid or self.project.id])

    def _gen_url(self, pid=None):
        return reverse("v1:subtitles:subtitles-generate", args=[pid or self.project.id])

    def test_get_lists_presets_and_null_subtitle(self):
        res = self.client.get(self._list_url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        keys = {p["preset"] for p in res.data["presets"]}
        self.assertEqual(keys, {"clean", "bold", "reels"})
        self.assertIsNone(res.data["subtitle"])

    def test_generate_creates_track_with_style(self):
        res = self.client.post(self._gen_url(), {"preset": "bold"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["subtitle"]["preset"], "bold")
        self.assertEqual(res.data["subtitle"]["style"]["font_weight"], 800)
        self.assertTrue(res.data["subtitle"]["url"])

    def test_srt_omits_deleted_segments(self):
        self.client.post(self._gen_url(), {"preset": "clean"}, format="json")
        subtitle = Subtitle.objects.get(project=self.project)
        content = subtitle.file.read().decode("utf-8")
        self.assertIn("جمله اول", content)
        self.assertIn("جمله سوم", content)
        self.assertNotIn("حذف‌شده", content)
        # Two kept cues, renumbered 1 and 2.
        self.assertIn("1\n", content)
        self.assertIn("2\n", content)

    def test_generate_rejects_unknown_preset(self):
        res = self.client.post(self._gen_url(), {"preset": "fancy"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generate_requires_transcript(self):
        empty = Project.objects.create(user=self.user, title="No transcript")
        res = self.client.post(self._gen_url(empty.id), {"preset": "reels"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_regenerate_replaces_preset(self):
        self.client.post(self._gen_url(), {"preset": "clean"}, format="json")
        self.client.post(self._gen_url(), {"preset": "reels"}, format="json")
        self.assertEqual(Subtitle.objects.filter(project=self.project).count(), 1)
        self.assertEqual(Subtitle.objects.get(project=self.project).preset, "reels")

    def test_cannot_generate_for_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        res = self.client.post(self._gen_url(theirs.id), {"preset": "reels"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(
            self.client.get(self._list_url()).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
