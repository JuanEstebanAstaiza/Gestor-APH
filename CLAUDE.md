# CLAUDE.md — Gestor APH

## Stack
- Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL (schema via direct SQL, NO Alembic)
- Frontend: React 19 + TypeScript + Vite + TanStack Query + Zustand
- Infra: Docker Compose

## Setup
```bash
docker compose up -d
cd backend && uv pip install -e ".[dev]" && cp .env.example .env
# Schema: apply init_schema.sql directly to PostgreSQL (see Documentacion/SetupDirectSQL.md)
uvicorn src.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## Architecture decisions (DO NOT CHANGE)
- Single-tenant MVP — no `property_id` in tables
- UUID external, SERIAL internal FKs
- Soft deletes everywhere (`is_active`)
- RBAC via JWT claim: admin(4) > consejo(3) > vigilancia(2) > residente(1)
- Cloud storage (S3/R2) — MVP uses local filesystem
- TanStack Query for server state, Zustand for global state

## Project structure
```
backend/src/
  main.py, config.py, dependencies.py
  core/ (security.py, permissions.py, exceptions.py)
  models/ (user.py, refresh_token.py, visitor.py, authorization.py, census.py, asset.py, resident_asset.py, resident_file.py, document.py, activity_log.py)
  schemas/ (auth.py, user.py, visitor.py, authorization.py, census.py, asset.py, document.py, category.py, shared.py)
  routers/ (auth.py, users.py, visitors.py, authorizations.py, census.py, assets.py, documents.py, categories.py, audit.py)
  services/ (auth_service.py, file_service.py, document_service.py, census_service.py)
  tasks/ (auto_classify.py)
  tests/
frontend/src/
  main.tsx, App.tsx
  hooks/ (useAuth.ts, useApi.ts, usePermissions.ts)
  lib/ (api.ts, constants.ts, utils.ts)
  store/ (authStore.ts)
  styles/ (theme.css)
  types/ (index.ts)
  components/common/ (Layout, Sidebar, Header, DataTable, FileUpload, SearchBar)
  pages/ (auth, dashboard, users, visitors, authorizations, census, assets, documents, audit, settings)
```

## Development phases (each has detailed doc in `Documentacion/fases/`)
10. Services + Tasks — [PHASE_10_SERVICES_AND_TASKS.md](Documentacion/fases/PHASE_10_SERVICES_AND_TASKS.md) **COMPLETADA**
11. Modulo A — Gestion Financiera — [PHASE_11_MODULO_A_FINANCIERO.md](Documentacion/fases/PHASE_11_MODULO_A_FINANCIERO.md)
12. Modulo C — Atencion y Comunicacion — [PHASE_12_MODULO_C_ATENCION.md](Documentacion/fases/PHASE_12_MODULO_C_ATENCION.md)
13. Modulo G — Reservas y Convivencia — [PHASE_13_MODULO_G_RESERVAS.md](Documentacion/fases/PHASE_13_MODULO_G_RESERVAS.md)
14. Modulo F — Asambleas y Consejo — [PHASE_14_MODULO_F_ASAMBLEAS.md](Documentacion/fases/PHASE_14_MODULO_F_ASAMBLEAS.md)
15. Modulo D — Directorio de Proveedores — [PHASE_15_MODULO_D_PROVEEDORES.md](Documentacion/fases/PHASE_15_MODULO_D_PROVEEDORES.md)
16. UI/UX refinement — [PHASE_16_UI_UX.md](Documentacion/fases/PHASE_16_UI_UX.md)
17. Testing — [PHASE_17_TESTING.md](Documentacion/fases/PHASE_17_TESTING.md)
18. Docker production — [PHASE_18_DOCKER_PRODUCTION.md](Documentacion/fases/PHASE_18_DOCKER_PRODUCTION.md)

## Permisos (role hierarchy)
- Admin: all endpoints
- Consejo: census, assets, documents, audit, visitors, authorizations
- Vigilancia: visitors, documents
- Residente: own authorizations, own documents, own profile

## IMPORTANT
- Read `Documentacion/ListaDeLaVerdad.md` for full specifications
- Read `Documentacion/GuiaDeContinuidad.md` for continuity guide
- Do NOT delete existing code
- Do NOT change the stack or schema
- **NO ALEMBIC** — Schema se gestiona con SQL directo (`init_schema.sql`). Alembic NO se usa por problemas de compatibilidad con Windows/Python 3.12.
- Inline styles are temporary — refactor in Phase 16
