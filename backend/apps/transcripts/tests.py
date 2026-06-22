"""Tests for the Epic 6 processing pipeline (merge → transcript → timeline).

FFmpeg is mocked (no binary needed, no real encoding) and Celery runs eagerly, so
the chain executes inline. The offline stub AI provider supplies the transcript.
``CELERY_TASK_EAGER_PROPAGATES`` is off so a failing task records the failure
(and the project's FAILED_* status) without bubbling out of the HTTP request.
"""
import contextlib
import shutil
import tempfile
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai.providers.factory import get_provider
from apps.projects.models import Project
from apps.videos.models import SourceVideo

from .models import Transcript, TranscriptSegment

User = get_user_model()

MEDIA_ROOT = tempfile.mkdtemp()


def _fake_merge(inputs, output):
    # Stand in for FFmpeg: write a small file at the requested output path.
    with open(output, "wb") as fh:
        fh.write(b"merged-bytes")


@contextlib.contextmanager
def fake_ffmpeg(merge=_fake_merge):
    with mock.patch("apps.common.ffmpeg.merge_videos", side_effect=merge), mock.patch(
        "apps.common.ffmpeg.probe_duration", return_value=12.5
    ), mock.patch("apps.common.ffmpeg.extract_audio", return_value=None):
        yield


@override_settings(
    MEDIA_ROOT=MEDIA_ROOT,
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=False,
    AI_PROVIDER="stub",
    GAPGPT_API_KEY="",
)
class ProcessingPipelineTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        get_provider.cache_clear()  # honor AI_PROVIDER override
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.project = Project.objects.create(user=self.user, title="Reel")
        self.client.force_authenticate(self.user)

    # --- helpers -----------------------------------------------------------
    def _add_clip(self, name="a.mp4"):
        return self.client.post(
            reverse("v1:videos:video-list", args=[self.project.id]),
            {"file": SimpleUploadedFile(name, b"x", content_type="video/mp4")},
            format="multipart",
        )

    def _process_url(self, pid=None):
        return reverse("v1:transcripts:process", args=[pid or self.project.id])

    def _status_url(self, pid=None):
        return reverse("v1:transcripts:processing-status", args=[pid or self.project.id])

    # --- tests -------------------------------------------------------------
    def test_process_runs_full_pipeline(self):
        self._add_clip("a.mp4")
        self._add_clip("b.mp4")
        with fake_ffmpeg():
            res = self.client.post(self._process_url())

        self.assertEqual(res.status_code, status.HTTP_202_ACCEPTED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.Status.READY_FOR_EDITING)

        source = SourceVideo.objects.get(project=self.project)
        self.assertEqual(source.duration, 12.5)
        self.assertTrue(source.file)

        transcript = Transcript.objects.get(project=self.project)
        self.assertTrue(transcript.segments.exists())

    def test_process_requires_at_least_one_clip(self):
        res = self.client.post(self._process_url())
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.Status.DRAFT)

    def test_processing_status_returns_timeline(self):
        self._add_clip("a.mp4")
        with fake_ffmpeg():
            self.client.post(self._process_url())

        res = self.client.get(self._status_url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], Project.Status.READY_FOR_EDITING)
        self.assertEqual(res.data["timeline"]["duration"], 12.5)
        self.assertIsNotNone(res.data["timeline"]["source_video"])
        self.assertTrue(len(res.data["timeline"]["segments"]) > 0)
        first = res.data["timeline"]["segments"][0]
        self.assertIn("text", first)
        self.assertIn("start_time", first)
        self.assertFalse(first["deleted"])

    def test_regenerate_replaces_transcript_and_source(self):
        self._add_clip("a.mp4")
        with fake_ffmpeg():
            self.client.post(self._process_url())
            first_count = TranscriptSegment.objects.filter(
                transcript__project=self.project
            ).count()
            # status moved to READY; reset so a second process is allowed
            self.project.status = Project.Status.DRAFT
            self.project.save(update_fields=["status"])
            self.client.post(self._process_url())

        self.assertEqual(SourceVideo.objects.filter(project=self.project).count(), 1)
        self.assertEqual(Transcript.objects.filter(project=self.project).count(), 1)
        self.assertEqual(
            TranscriptSegment.objects.filter(transcript__project=self.project).count(),
            first_count,
        )

    def test_merge_failure_marks_project_failed(self):
        # Exercise the task directly: under eager Celery a chain re-raises the
        # stored failure, but a real worker returns immediately, so the meaningful
        # assertion is that the task records the FAILED_UPLOAD status on error.
        self._add_clip("a.mp4")
        from apps.videos.tasks import merge_clips_task

        def boom(inputs, output):
            raise RuntimeError("ffmpeg exploded")

        with mock.patch("apps.common.ffmpeg.merge_videos", side_effect=boom):
            with self.assertRaises(RuntimeError):
                merge_clips_task(str(self.project.id))

        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.Status.FAILED_UPLOAD)

    def test_cannot_process_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        res = self.client.post(self._process_url(theirs.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_processing_status_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(
            self.client.get(self._status_url()).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
