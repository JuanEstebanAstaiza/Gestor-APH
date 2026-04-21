# Gestor APH — Backend

FastAPI + SQLAlchemy + PostgreSQL

## Setup

```bash
# Install dependencies
uv pip install -e ".[dev]"

# Setup database
docker compose up -d  # postgres
alembic upgrade head  # run migrations

# Run server
uvicorn src.main:app --reload --port 8000
```

## Environment

Copy `.env.example` to `.env` and configure `DATABASE_URL` and `JWT_SECRET_KEY`.
