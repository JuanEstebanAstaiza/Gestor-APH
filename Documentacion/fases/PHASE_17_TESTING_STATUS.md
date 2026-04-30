# Phase 17 — Testing: Estado de Implementación

## Estado: EN PROGRESO

## Completado

### Infraestructura de tests (backend)
- `backend/src/tests/conftest.py` — Test DB con SQLite, fixtures para:
  - `db_session` — sesión con cleanup automático
  - `client` / `async_client` — TestClient con override de get_db
  - `admin_user`, `consejo_user`, `vigilancia_user`, `residente_user`, `suspended_user`, `pending_user` — usuarios de rol variado
  - `admin_token`, `residente_token`, `admin_headers`, `residente_headers` — tokens y headers
  - `test_resident` — residente con census + asset link
  - `_create_test_db()` — schema completo en SQLite (50+ tablas)
  - `patch_settings` — JWT secret y expiraciones overrides
  - Seed de document_categories

### Tests de Auth
- `test_auth_login.py` — login exitoso, credentials invalidas, account suspended, last_login update
- `test_auth_refresh.py` — refresh token rotation, expired token, revoked token, wrong type token
- `test_auth_logout.py` — logout, token revocation, refresh after logout blocked
- `test_auth_register.py` — register success, duplicate email, empty body, missing name, pending status

### Tests de Permissions
- `test_permissions.py` — role hierarchy, suspended user access, unauthenticated access
- `test_permissions_endpoint_access.py` — users CRUD, census, assets, audit endpoint access by role

### Tests de CRUD
- `test_users_crud.py` — create, read, update password, soft delete, login after delete
- `test_census_crud.py` — create, read (list/get/filter), update, partial update
- `test_assets_crud.py` — create (apartment/parking/storage), read, update, soft delete
- `test_documents_crud.py` — upload, list, search, update, soft delete, share token
- `test_visitors_crud.py` — create, read, approve/revoke/complete, soft delete
- `test_authorizations_crud.py` — create, read, approve/reject, soft delete

### Tests de Services
- `test_file_service.py` — allowed types, size limit, upload path, download check, delete
- `test_document_service.py` — auto-classify, search, share token generation

## Pendiente

### Backend tests
- `tests/test_finance_crud.py` — accounts, invoices, payments, balance, paz y salvo
- `tests/test_pqrs_crud.py` — PQRS create/read/update/close
- `tests/test_faq_crud.py` — FAQ entries CRUD
- `tests/test_circulars_crud.py` — Circulares CRUD
- `tests/test_reservations_crud.py` — Reservas CRUD + calendar
- `tests/test_infractions_crud.py` — Infracciones CRUD
- `tests/test_regulations_crud.py` — Regulations CRUD
- `tests/test_assemblies_crud.py` — Asambleas CRUD + agendas
- `tests/test_attendance_crud.py` — Attendance tracking
- `tests/test_votes_crud.py` — Vote submission + summary
- `tests/test_minutes_crud.py` — Actas CRUD
- `tests/test_tasks_crud.py` — Task followups CRUD
- `tests/test_providers_crud.py` — Providers CRUD + contracts
- `tests/test_maintenance_crud.py` — Maintenance alerts CRUD + dashboard
- `tests/test_finance_service.py` — balance computation, paz y salvo generation
- `tests/test_census_service.py` — stats, export, profile
- `tests/test_email_service.py` — email sending (mocked)
- `tests/test_notification_service.py` — notification dispatch

### Frontend tests
- `frontend/vitest.config.ts` — Vitest config
- `frontend/src/setupTests.ts` — Testing library setup
- `frontend/tests/components/Layout.test.tsx`
- `frontend/tests/components/Sidebar.test.tsx`
- `frontend/tests/components/Header.test.tsx`
- `frontend/tests/components/DataTable.test.tsx`
- `frontend/tests/components/Button.test.tsx`
- `frontend/tests/components/Input.test.tsx`
- `frontend/tests/components/Modal.test.tsx`
- `frontend/tests/components/FileUpload.test.tsx`
- `frontend/tests/hooks/useAuth.test.tsx`
- `frontend/tests/hooks/usePermissions.test.ts`
- `frontend/tests/pages/Login.test.tsx`
- `frontend/tests/pages/Register.test.tsx`
- `frontend/tests/pages/Dashboard.test.tsx`
- `frontend/tests/utils/formatting.test.ts`

## Cómo ejecutar

```bash
cd backend
uv pip install -e ".[dev]"
pytest src/tests/ -v
pytest src/tests/ -v --cov=src --cov-report=term-missing
```

## Notas técnicas
- SQLite para tests (no PostgreSQL real) — compatible con SQLAlchemy ORM
- Schema SQL inline en conftest.py (50+ tablas)
- JWT secret override: "test-secret-key-for-testing-purposes-only-do-not-use-in-production"
- Coverage target: 70%
