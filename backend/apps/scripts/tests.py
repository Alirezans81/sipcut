"""Tests for the Script generation/retrieval API."""
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai.providers import get_provider
from apps.ai.providers.gapgpt import AIProviderError
from apps.projects.models import Project

from .models import Script

User = get_user_model()

# Force the offline stub provider regardless of environment.
PROVIDER_PATH = "apps.scripts.services.get_provider"


@override_settings(AI_PROVIDER="stub", GAPGPT_API_KEY="")
class ScriptAPITests(APITestCase):
    def setUp(self):
        get_provider.cache_clear()  # honor override_settings (cache is process-wide)
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.project = Project.objects.create(user=self.user, title="Fitness Reel")
        self.client.force_authenticate(self.user)

    def _gen_url(self, pid):
        return reverse("v1:scripts:script-generate", args=[pid])

    def _get_url(self, pid):
        return reverse("v1:scripts:script", args=[pid])

    def test_generate_creates_script(self):
        res = self.client.post(self._gen_url(self.project.id), {"prompt": "کاهش وزن"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["title"])
        self.assertIsInstance(res.data["shot_list"], list)
        self.assertTrue(Script.objects.filter(project=self.project).exists())

    def test_generate_requires_prompt(self):
        res = self.client.post(self._gen_url(self.project.id), {"prompt": "  "})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_regenerate_replaces_existing(self):
        self.client.post(self._gen_url(self.project.id), {"prompt": "اول"})
        self.client.post(self._gen_url(self.project.id), {"prompt": "دوم"})
        self.assertEqual(Script.objects.filter(project=self.project).count(), 1)

    def test_get_script(self):
        self.client.post(self._gen_url(self.project.id), {"prompt": "کاهش وزن"})
        res = self.client.get(self._get_url(self.project.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["script"])

    def test_get_missing_script_returns_404(self):
        res = self.client.get(self._get_url(self.project.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_generate_for_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        res = self.client.post(self._gen_url(theirs.id), {"prompt": "test"})
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_provider_error_returns_502(self):
        with patch(PROVIDER_PATH) as get_provider:
            get_provider.return_value.generate_script.side_effect = AIProviderError("boom")
            res = self.client.post(self._gen_url(self.project.id), {"prompt": "x"})
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)
