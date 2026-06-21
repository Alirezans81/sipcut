"""Tests for the Project CRUD API and owner scoping."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Project

User = get_user_model()


class ProjectAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone_number="+989120000001", is_verified=True)
        self.other = User.objects.create_user(phone_number="+989120000002", is_verified=True)
        self.list_url = reverse("v1:projects:project-list")

    def _detail_url(self, pk):
        return reverse("v1:projects:project-detail", args=[pk])

    def test_requires_auth(self):
        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_project(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.list_url, {"title": "  Hair Salon Reel  "})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Hair Salon Reel")  # trimmed
        self.assertEqual(res.data["status"], Project.Status.DRAFT)
        project = Project.objects.get(id=res.data["id"])
        self.assertEqual(project.user, self.user)

    def test_create_rejects_empty_title(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(self.list_url, {"title": "   "})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_only_own_projects(self):
        Project.objects.create(user=self.user, title="Mine")
        Project.objects.create(user=self.other, title="Theirs")
        self.client.force_authenticate(self.user)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in res.data]
        self.assertEqual(titles, ["Mine"])

    def test_cannot_retrieve_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        self.client.force_authenticate(self.user)
        res = self.client.get(self._detail_url(theirs.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_project(self):
        mine = Project.objects.create(user=self.user, title="Mine")
        self.client.force_authenticate(self.user)
        res = self.client.delete(self._detail_url(mine.id))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=mine.id).exists())

    def test_cannot_delete_others_project(self):
        theirs = Project.objects.create(user=self.other, title="Theirs")
        self.client.force_authenticate(self.user)
        res = self.client.delete(self._detail_url(theirs.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Project.objects.filter(id=theirs.id).exists())
