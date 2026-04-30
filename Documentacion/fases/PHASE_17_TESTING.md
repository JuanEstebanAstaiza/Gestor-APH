# Phase 17 — Testing Completo

## Estado: EN PROGRESO (infraestructura + auth + permissions + core CRUD completados)

## Objetivo
Implementar suite de tests para backend y frontend.

## Contexto
Actualmente solo existe `test_auth.py` básico. Se necesita testing completo.

## Backend testing

### Auth tests
- [x] `tests/test_auth_login.py` — login exitoso, credentials invalidas, account suspended
- [x] `tests/test_auth_refresh.py` — refresh token rotation, expired token, revoked token
- [x] `tests/test_auth_logout.py` — logout, token revocation
- [ ] `tests/test_auth_forgot.py` — forgot password flow (endpoint no implementado en backend)
- [x] `tests/test_auth_register.py` — register success, duplicate email, pending status

### Permission tests
- [x] `tests/test_permissions.py` — role hierarchy enforcement, suspended user, unauthenticated
- [x] `tests/test_permissions_endpoint_access.py` — cada endpoint verifica rol correcto

### CRUD tests
- [x] `tests/test_users_crud.py` — create, read, update password, soft delete, login after delete
- [x] `tests/test_census_crud.py` — create, read (list/get/filter), update, partial update
- [x] `tests/test_assets_crud.py` — create (apartment/parking/storage), read, update, soft delete
- [x] `tests/test_documents_crud.py` — upload, list, search, update, soft delete, share token
- [x] `tests/test_visitors_crud.py` — create, read, approve/revoke/complete, soft delete
- [x] `tests/test_authorizations_crud.py` — create, read, approve/reject, soft delete

### Service tests
- [x] `tests/test_file_service.py` — allowed types, size limit, upload path, download check, delete
- [x] `tests/test_document_service.py` — auto-classify, search, share token generation
- [ ] `tests/test_census_service.py` — stats, export, profile
- [ ] `tests/test_finance_service.py` — balance computation, paz y salvo generation
- [ ] `tests/test_email_service.py` — email sending (mocked)
- [ ] `tests/test_notification_service.py` — notification dispatch

### Modules pendientes (backend)
- [ ] `tests/test_finance_crud.py` — accounts, invoices, payments, balance, paz y salvo
- [ ] `tests/test_pqrs_crud.py` — PQRS create/read/update/close
- [ ] `tests/test_faq_crud.py` — FAQ entries CRUD
- [ ] `tests/test_circulars_crud.py` — Circulares CRUD
- [ ] `tests/test_reservations_crud.py` — Reservas CRUD + calendar
- [ ] `tests/test_infractions_crud.py` — Infracciones CRUD
- [ ] `tests/test_regulations_crud.py` — Regulations CRUD
- [ ] `tests/test_assemblies_crud.py` — Asambleas CRUD + agendas
- [ ] `tests/test_attendance_crud.py` — Attendance tracking
- [ ] `tests/test_votes_crud.py` — Vote submission + summary
- [ ] `tests/test_minutes_crud.py` — Actas CRUD
- [ ] `tests/test_tasks_crud.py` — Task followups CRUD
- [ ] `tests/test_providers_crud.py` — Providers CRUD + contracts
- [ ] `tests/test_maintenance_crud.py` — Maintenance alerts CRUD + dashboard

### Frontend testing (`frontend/tests/`)
- [ ] `frontend/vitest.config.ts` — Vitest config
- [ ] `frontend/src/setupTests.ts` — Testing library setup
- [ ] `tests/components/` — Layout, Sidebar, Header, DataTable, Button, Input, Modal, FileUpload
- [ ] `tests/hooks/` — useAuth, usePermissions
- [ ] `tests/pages/` — Login, Register, Dashboard
- [ ] `tests/utils/` — formatting, validation helpers

## Infraestructura creada
- `backend/src/tests/conftest.py` — Test DB SQLite con 50+ tablas, fixtures de usuarios/roles/tokens
- `backend/src/tests/__init__.py`

## Decisiones técnicas
- **pytest** — para backend testing
- **Vitest** — para frontend testing (compatible con Vite)
- **SQLite** — test database (no PostgreSQL real) — compatible con SQLAlchemy ORM
- **JWT override** — secret key "test-secret-key-for-testing-purposes-only"
- **Coverage target: 70%** — no 100%, pero cubrir critical paths

## Checklist resumido
- [x] Infraestructura de tests (conftest, fixtures, test DB)
- [x] Auth tests (login, refresh, logout, register)
- [x] Permission tests (role hierarchy, endpoint access)
- [x] Core CRUD tests (users, census, assets, documents, visitors, authorizations)
- [x] Service tests (file_service, document_service)
- [ ] Finance tests (crud + service)
- [ ] Communication tests (pqrs, faq, circulars)
- [ ] Reservas/Convivencia tests
- [ ] Asambleas tests
- [ ] Proveedores/Mantenimiento tests
- [ ] Frontend tests (components, hooks, pages)
- [ ] Actualizar GuiaDeContinuidad.md con estado de Fase 17

## Cómo ejecutar
```bash
cd backend
uv pip install -e ".[dev]"
pytest src/tests/ -v
pytest src/tests/ -v --cov=src --cov-report=term-missing
```
