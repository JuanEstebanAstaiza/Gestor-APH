# Phase 18 — Docker Production

## Estado: PENDIENTE

## Objetivo
Configurar Docker production-ready para backend y frontend.

## Contexto
Actualmente existe `docker-compose.yml` básico (solo PostgreSQL). Se necesita Dockerfiles y compose para production.

## Deliverables

### Dockerfiles
- `backend/Dockerfile` — Python 3.12, uv, production deps, uvicorn
- `frontend/Dockerfile` — Node build stage + nginx serve stage
- `backend/.dockerignore` — exclude tests, dev deps, local files
- `frontend/.dockerignore` — exclude source maps, dev files

### Docker Compose production
- `docker-compose.production.yml` — compose file para production
- Services: postgres, backend, frontend
- Health checks para cada service
- Restart policies
- Network isolation
- Volume mounts para data persistence

### Environment configs
- `backend/.env.production` — example production env
- `frontend/.env.production` — example production env
- PostgreSQL data volume
- Upload files volume

### Health checks
- Backend: `/health` endpoint
- Frontend: `/` endpoint
- PostgreSQL: `pg_isready`

## Decisiones técnicas
- **Multi-stage build frontend** — build con node, serve con nginx
- **uvicorn production** — workers config, gunicorn wrapper opcional
- **PostgreSQL data volume** — named volume para persistencia
- **No dev tools en production** — exclude pytest, debug deps
- **nginx for frontend** — static file serve, API proxy

## Checklist
- [ ] Crear `backend/Dockerfile`
- [ ] Crear `frontend/Dockerfile`
- [ ] Crear `backend/.dockerignore`
- [ ] Crear `frontend/.dockerignore`
- [ ] Crear `docker-compose.production.yml`
- [ ] Crear `backend/.env.production`
- [ ] Crear `frontend/.env.production`
- [ ] Agregar health checks
- [ ] Configurar restart policies
- [ ] Configurar volumes
- [ ] Testear deploy completo con docker-compose
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 18
