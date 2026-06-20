"""Celery application for SipCut background processing.

All heavy media operations (merge, transcript, cleanup, render) run here so they
never block HTTP requests — see docs/ARCHITECTURE.md (Background Processing).
"""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("sipcut")

# All Celery config lives in Django settings, namespaced with CELERY_.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every installed app.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
