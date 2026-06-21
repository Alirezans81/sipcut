from django.contrib import admin

from .models import Script


@admin.register(Script)
class ScriptAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "created_at")
    search_fields = ("title", "project__title")
    readonly_fields = ("created_at", "updated_at")
