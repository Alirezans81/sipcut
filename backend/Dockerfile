# SipCut backend image. Includes FFmpeg so Celery workers can process video
# (merge, cleanup, render) in later epics — see docs/ARCHITECTURE.md.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# System deps: FFmpeg for media processing, build tools for psycopg2.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

# Default command runs the API; the worker service overrides this in compose.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
