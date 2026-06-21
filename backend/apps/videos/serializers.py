"""Serializers for video clips."""
import os

from django.conf import settings
from rest_framework import serializers

from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    """Read representation; ``name`` is writable to support renaming."""

    url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ("id", "name", "url", "duration", "order", "created_at")
        read_only_fields = ("id", "url", "duration", "order", "created_at")

    def get_url(self, obj: Video) -> str:
        url = obj.file.url
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("نام کلیپ را وارد کنید.")
        return value


class VideoUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    # Optional: the client may send the duration it read from the file.
    duration = serializers.FloatField(required=False, min_value=0, default=0)

    def validate_file(self, f):
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if f.size > max_bytes:
            raise serializers.ValidationError(
                f"حجم فایل نباید بیشتر از {settings.MAX_UPLOAD_SIZE_MB} مگابایت باشد."
            )
        ext = os.path.splitext(f.name)[1].lower()
        if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
            raise serializers.ValidationError("فرمت ویدیو پشتیبانی نمی‌شود.")
        return f


class ReorderSerializer(serializers.Serializer):
    video_ids = serializers.ListField(
        child=serializers.UUIDField(), allow_empty=False
    )
