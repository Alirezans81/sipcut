"""Shared abstract models reused across SipCut apps.

Entities in docs/DATABASE.md all carry an ``id`` plus ``created_at`` /
``updated_at`` timestamps. UUID primary keys keep object-storage paths and public
API ids non-enumerable.
"""
import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Adds self-managing ``created_at`` / ``updated_at`` fields."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("-created_at",)


class UUIDModel(models.Model):
    """Uses a UUID primary key instead of a sequential integer."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel):
    """Convenience base: UUID primary key + timestamps."""

    class Meta:
        abstract = True
        ordering = ("-created_at",)
