# Phase 17 — Testing Completo

## Estado: PENDIENTE

## Objetivo
Implementar suite de tests para backend y frontend.

## Contexto
Actualmente solo existe `test_auth.py` básico. Se necesita testing completo.

## Backend testing

### Auth tests
- `tests/test_auth_login.py` — login exitoso, credentials invalidas, account suspended
- `tests/test_auth_refresh.py` — refresh token rotation, expired token, revoked token
- `tests/test_auth_logout.py` — logout, token revocation
- `tests/test_auth_forgot.py` — forgot password flow

### Permission tests
- `tests/test_permissions.py` — role hierarchy enforcement
- `tests/test_permissions_endpoint_access.py` — cada endpoint verifica rol correcto

### CRUD tests
- `tests/test_users_crud.py` — create, read, update, delete, soft delete
- `tests/test_census_crud.py` — create, read, update, delete
- `tests/test_assets_crud.py` — create, read, update, delete
- `tests/test_documents_crud.py` — upload, download, search, share
- `tests/test_visitors_crud.py` — create, approve, revoke
- `tests/test_authorizations_crud.py` — create, approve, reject

### Service tests
- `tests/test_file_service.py` — upload, download, delete, validation
- `tests/test_document_service.py` — auto-classify, search, share tokens
- `tests/test_census_service.py` — stats, export, profile

### Frontend testing (`frontend/tests/`)
- `tests/components/` — Layout, Sidebar, Header, DataTable, FileUpload
- `tests/hooks/` — useAuth, useApi, usePermissions
- `tests/pages/` — Login, Register, Dashboard
- `tests/utils/` — formatting, validation helpers

## Decisiones técnicas
- **pytest** — para backend testing
- **Vitest** — para frontend testing (compatible con Vite)
- **Test database** — usar PostgreSQL test container o SQLite in-memory para unit tests
- **No integration tests con real DB** — MVP puede usar SQLite para tests
- **Coverage target: 70%** — no 100%, pero cubrir critical paths

## Checklist
- [ ] Agregar pytest dependencies a `pyproject.toml`
- [ ] Crear `tests/test_auth_login.py`
- [ ] Crear `tests/test_auth_refresh.py`
- [ ] Crear `tests/test_auth_logout.py`
- [ ] Crear `tests/test_auth_forgot.py`
- [ ] Crear `tests/test_permissions.py`
- [ ] Crear `tests/test_users_crud.py`
- [ ] Crear `tests/test_census_crud.py`
- [ ] Crear `tests/test_assets_crud.py`
- [ ] Crear `tests/test_documents_crud.py`
- [ ] Crear `tests/test_visitors_crud.py`
- [ ] Crear `tests/test_authorizations_crud.py`
- [ ] Crear `tests/test_file_service.py`
- [ ] Crear `tests/test_document_service.py`
- [ ] Crear `tests/test_census_service.py`
- [ ] Crear `frontend/tests/components/`
- [ ] Crear `frontend/tests/hooks/`
- [ ] Crear `frontend/tests/pages/`
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 17
