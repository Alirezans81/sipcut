"""Tests for the video clip API (upload, ordering, rename, delete)."""
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.projects.models import Project

from .models import Video

User = get_user_model()

MEDIA_ROOT = tempfile.mkdtemp()


def _clip(name="clip.mp4"):
    return SimpleUploadedFile(name, b"fake-bytes", content_type="video/mp4")


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class VideoAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.project = Project.objects.create(user=self.user, title="Reel")
        self.client.force_authenticate(self.user)

    def _list_url(self, pid=None):
        return reverse("v1:videos:video-list", args=[pid or self.project.id])

    def _detail_url(self, vid, pid=None):
        return reverse("v1:videos:video-detail", args=[pid or self.project.id, vid])

    def _reorder_url(self, pid=None):
        return reverse("v1:videos:video-reorder", args=[pid or self.project.id])

    def test_upload_assigns_incrementing_order(self):
        r1 = self.client.post(self._list_url(), {"file": _clip("a.mp4")}, format="multipart")
        r2 = self.client.post(self._list_url(), {"file": _clip("b.mp4")}, format="multipart")
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r1.data["order"], 0)
        self.assertEqual(r2.data["order"], 1)
        self.assertEqual(r1.data["name"], "a.mp4")
        self.assertTrue(r1.data["url"])

    def test_rejects_non_video_extension(self):
        bad = SimpleUploadedFile("notes.txt", b"x", content_type="text/plain")
        res = self.client.post(self._list_url(), {"file": bad}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_returns_clips_in_order(self):
        for n in ["a.mp4", "b.mp4", "c.mp4"]:
            self.client.post(self._list_url(), {"file": _clip(n)}, format="multipart")
        res = self.client.get(self._list_url())
        self.assertEqual([v["name"] for v in res.data], ["a.mp4", "b.mp4", "c.mp4"])

    def test_reorder(self):
        ids = [
            self.client.post(self._list_url(), {"file": _clip(n)}, format="multipart").data["id"]
            for n in ["a.mp4", "b.mp4", "c.mp4"]
        ]
        reversed_ids = list(reversed(ids))
        res = self.client.post(self._reorder_url(), {"video_ids": reversed_ids}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual([v["id"] for v in res.data], reversed_ids)
        self.assertEqual([v["order"] for v in res.data], [0, 1, 2])

    def test_reorder_must_be_full_permutation(self):
        ids = [
            self.client.post(self._list_url(), {"file": _clip(n)}, format="multipart").data["id"]
            for n in ["a.mp4", "b.mp4"]
        ]
        res = self.client.post(self._reorder_url(), {"video_ids": [ids[0]]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rename(self):
        vid = self.client.post(self._list_url(), {"file": _clip("a.mp4")}, format="multipart").data["id"]
        res = self.client.patch(self._detail_url(vid), {"name": "Hook"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Hook")

    def test_delete(self):
        vid = self.client.post(self._list_url(), {"file": _clip("a.mp4")}, format="multipart").data["id"]
        res = self.client.delete(self._detail_url(vid))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Video.objects.filter(id=vid).exists())

    def test_cannot_upload_to_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        res = self.client.post(self._list_url(theirs.id), {"file": _clip()}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self._list_url()).status_code, status.HTTP_401_UNAUTHORIZED)
