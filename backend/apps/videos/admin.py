from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "order", "duration", "created_at")
    list_filter = ("project",)
    search_fields = ("name", "project__title")
    readonly_fields = ("created_at", "updated_at")
