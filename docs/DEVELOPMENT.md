# SipCut — Development Setup

This guide covers running the SipCut MVP locally. Project scaffolding is complete
(Epic 1); features land in subsequent epics (see [TASKS.md](TASKS.md)).

## Repository layout

```text
sipcut/
├── backend/      Django + DRF API, Celery workers, AI provider abstraction
├── frontend/     Next.js (App Router) + TypeScript + Tailwind + ShadCN UI
├── docs/         Product, architecture, API, DB, UI and journey specs
└── docker-compose.yml   Postgres + Redis + API + Celery worker
```

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 and Redis 7 (or Docker, which provides both)
- FFmpeg (only needed once video processing epics begin)

---

## Option A — Docker (backend stack)

Brings up PostgreSQL, Redis, the API, and a Celery worker:

```bash
cp backend/.env.example backend/.env      # then edit secrets
docker compose up --build
```

API: http://localhost:8000/api/v1/health/

The frontend still runs locally (see below) and talks to the dockerized API.

---

## Option B — Run services directly

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate          # Windows;  source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env             # edit DATABASE_URL, Redis, GapGPT key, etc.

python manage.py migrate
python manage.py runserver       # http://localhost:8000
```

Celery worker (separate terminal, needs Redis running):

```bash
cd backend
celery -A config worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_URL -> backend
npm run dev                       # http://localhost:3000
```

---

## Configuration

All backend configuration is environment-driven — see
[`backend/.env.example`](../backend/.env.example). Notable groups:

| Area      | Variables |
|-----------|-----------|
| Database  | `DATABASE_URL` |
| Celery    | `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` |
| Storage   | `USE_S3`, `AWS_*` (Arvan Cloud S3-compatible endpoint) |
| Auth/JWT  | `JWT_ACCESS_LIFETIME_MINUTES`, `JWT_REFRESH_LIFETIME_DAYS` |
| AI        | `AI_PROVIDER`, `GAPGPT_API_KEY`, `GAPGPT_BASE_URL` |

Storage defaults to the local filesystem (`USE_S3=false`) for early development;
set `USE_S3=true` with Arvan Cloud credentials for object storage.

## Useful checks

```bash
# Backend
cd backend && python manage.py check

# Frontend
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```
