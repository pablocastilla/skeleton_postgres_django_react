# Inventory Demo (Django + React)

Simple inventory management demo that pairs a Django REST backend (managed by [uv](https://docs.astral.sh/uv/latest/)) with a Vite/React frontend.

## Prerequisites

- Python 3.12 (managed automatically when using `uv`)
- Node.js 20+
- Docker (optional, required for container image)

## Backend (Django + uv)

```bash
cd backend
uv sync --group dev --group test
uv run python src/manage.py migrate
uv run python src/manage.py runserver
```

Environment variables (copy `backend/.env.example` to `.env`):

- `DATABASE_URL` (defaults to SQLite when omitted)
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`

### Tests & linting

```bash
uv run --group dev ruff check src
uv run --group dev ruff format --check src
uv run --group test pytest
```

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## VS Code integration

The `.vscode` folder provides ready-to-run launch configurations:

- `Backend: Django server`
- `Frontend: Vite in Chrome`
- Compound workflow to launch both

## Docker

Build and run the combined image:

```bash
docker build -t inventory-app .
docker run --rm -p 8000:8000 inventory-app
```

Provide `DATABASE_URL` and other Django settings via environment variables when running the container.

## Continuous Integration

The workflow at `.github/workflows/ci.yml`:

- Lints & tests the Django backend with `uv`, `ruff`, and `pytest`
- Lints & builds the React frontend
- On pushes to `main`, builds the Docker image and publishes it to GitHub Container Registry (`ghcr.io/<owner>/inventory-app`)
