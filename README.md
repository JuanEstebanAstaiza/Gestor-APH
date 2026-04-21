# Gestor APH

Sistema de gestión de copropiedad (Propiedad Horizontal) para Altura PH.

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TanStack Query + Zustand
- **Infra**: Docker Compose (PostgreSQL)

## Getting started

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Setup backend
cd backend
uv pip install -e ".[dev]"
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET_KEY
alembic upgrade head
uvicorn src.main:app --reload --port 8000

# 3. Setup frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Architecture

See `Documentacion/ListaDeLaVerdad.md` for full specifications.
