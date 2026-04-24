# Debugging Guide — Gestor APH

This document lists the steps to resolve common errors and get the project fully running.

## Prerequisites

1. **Docker** running with PostgreSQL container
2. **Python 3.12+** installed
3. **Node.js 18+** installed
4. **`uv`** package manager installed

---

## Step 1: Database Setup

### Problem: Connection fails or tables don't exist

**Fix:**
```bash
# Apply the schema
psql -U postgres -d gestor_aph -f init_schema.sql

# Verify tables exist
psql -U postgres -d gestor_aph -c "\dt"
```

If the database doesn't exist:
```bash
psql -U postgres -c "CREATE DATABASE gestor_aph;"
psql -U postgres -d gestor_aph -f init_schema.sql
```

---

## Step 2: Backend — Environment

### Problem: Validation errors on startup (missing SMTP fields, etc.)

**Fix:** Ensure `.env` has ALL required fields from `src/config.py`:
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/gestor_aph
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173
# SMTP (required even if not used at MVP stage)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@localhost
# S3 (MVP uses local filesystem, these can be empty)
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

---

## Step 3: Backend — Dependencies

### Problem: `uvicorn` not found, or import errors

**Fix:**
```bash
cd backend
uv pip install -e ".[dev]"
```

Key dependency versions that matter:
- `bcrypt < 5.0.0` (passlib is incompatible with bcrypt 5.0.0)
- SQLAlchemy 2.0+ (uses `Numeric`, NOT `Decimal`)
- Uses **direct bcrypt** (NOT passlib) in `src/core/security.py`

---

## Step 4: Backend — SQLAlchemy Model Errors

### Problem: `InvalidRequestError` about `back_populates` mismatches

This is the most common startup error. Every `relationship("X", back_populates="Y")` in Model A requires Model X to have a property named `Y` with `relationship("ModelA", back_populates="X's_property")`.

**Checklist of required back_populates pairs:**

| Model A property | Model B property |
|---|---|
| `User.refresh_tokens` ↔ `RefreshToken.user` | ✅ |
| `User.census` ↔ `CensusResident.user` | ✅ |
| `User.activity_log` ↔ `ActivityLog.user` | ✅ |
| `User.assemblies_created` ↔ `Assembly.creator` | ✅ |
| `User.agendas_presented` ↔ `Agenda.presenter` | ✅ |
| `User.minutes_created` ↔ `Minute.creator` | ✅ |
| `User.minutes_approved` ↔ `Minute.approver` | ✅ |
| `User.tasks_assigned` ↔ `TaskFollowup.assignee` | ✅ |
| `User.documents_created` ↔ `Document.creator` | ✅ |
| `User.documents_changed` ↔ `DocumentVersion.changer` | ✅ |
| `User.resident_files` ↔ `ResidentFile.uploader` | ✅ |
| `User.communications_sent` ↔ `Communication.sender` | ✅ |
| `User.maintenance_alerts` ↔ `MaintenanceAlert.notifier` | ✅ |
| `User.regulations_updated` ↔ `Regulation.updated_by_user` | ✅ |
| `CensusResident.assets` ↔ `ResidentAsset.resident` | ✅ |
| `CensusResident.files` ↔ `ResidentFile.resident` | ✅ |
| `CensusResident.visitors` ↔ `Visitor.resident` | ✅ |
| `CensusResident.authorizations` ↔ `Authorization.requester` | ✅ |
| `CensusResident.resident_invoices` ↔ `Invoice.resident` | ✅ |
| `CensusResident.reservations` ↔ `Reservation.resident` | ✅ |
| `CensusResident.infractions` ↔ `Infraction.resident` | ✅ |
| `CensusResident.attendance_records` ↔ `Attendance.resident` | ✅ |
| `CensusResident.votes` ↔ `Vote.resident` | ✅ |
| `Asset.linked_assets` ↔ `ResidentAsset.asset` | ✅ |
| `Asset.resident_assets` ↔ `ResidentAsset.resident` | ✅ |
| `Asset.reservations` ↔ `Reservation.asset` | ✅ |
| `Asset.infractions` ↔ `Infraction.asset` | ✅ |
| `Asset.maintenance_alerts` ↔ `MaintenanceAlert.asset` | ✅ |
| `Document.category` ↔ `DocumentCategory.documents` | ✅ |
| `Document.metadata_entries` ↔ `DocumentMetadata.document` | ✅ |
| `Document.versions` ↔ `DocumentVersion.document` | ✅ |
| `Invoice.payments` ↔ `Payment.invoice` | ✅ |
| `Assembly.agendas` ↔ `Agenda.assembly` | ✅ |
| `Assembly.attendance` ↔ `Attendance.assembly` | ✅ |
| `Assembly.votes` ↔ `Vote.assembly` | ✅ |
| `Assembly.minutes_list` ↔ `Minute.assembly` | ✅ |
| `Assembly.tasks` ↔ `TaskFollowup.assembly` | ✅ |
| `Provider.contracts` ↔ `ProviderContract.provider` | ✅ |
| `Provider.alerts` ↔ `MaintenanceAlert.provider` | ✅ |
| `PQRS.attachments` ↔ `PQRSAttachment.pqrs` | ✅ |

**If you get a new error:** Find the two models involved and ensure both sides of the relationship pair have matching `back_populates` names.

### Problem: `Mapped[int]` / `Mapped[bool]` column type errors

**Fix:** Every `mapped_column()` that has `primary_key`, `default`, `ForeignKey`, or `nullable=True` must have an explicit type argument:
```python
# WRONG
id: Mapped[int] = mapped_column(primary_key=True)
is_active: Mapped[bool] = mapped_column(default=True)

# CORRECT
id: Mapped[int] = mapped_column(Integer, primary_key=True)
is_active: Mapped[bool] = mapped_column(Boolean, default=True)
```

Apply to ALL model files: `user.py`, `refresh_token.py`, `visitor.py`, `authorization.py`, `census.py`, `asset.py`, `finance.py`, `reservation.py`, `assembly.py`, `provider.py`, `document.py`, `communication.py`, `activity_log.py`, `resident_asset.py`, `resident_file.py`.

### Problem: `Decimal` import error

**Fix:** Replace `Decimal` with `Numeric` in all model files. SQLAlchemy 2.0+ uses `Numeric`, not `Decimal`.

### Problem: `JSONB` import error

**Fix:** Replace `JSONB` with `JSON`. Remove `JSONB` from dialects imports.

---

## Step 5: Backend — Start Server

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

If you see:
- **"Application startup complete"** → Backend is running
- **"InvalidRequestError"** → See Step 4
- **"OperationalError"** → Database not running or connection string wrong (see Step 1)
- **"ImportError"** → Dependencies not installed (see Step 3)

---

## Step 6: Frontend — Environment

### Problem: API calls fail or CORS errors

**Fix:** Ensure `frontend/.env` (or vite config) points to the backend:
```
VITE_API_URL=http://localhost:8000/api
```

---

## Step 7: Frontend — Dependencies

### Problem: `npm` not available, or build fails

**Fix:**
```bash
cd frontend
npm install
npm run dev
```

Key frontend fixes already applied:
- `AuthProvider` wrapped around `<App>` in `main.tsx` (required for `useAuth()` to work)
- All 37 page routes added to `App.tsx`
- `vite-env.d.ts` created for CSS import types

---

## Step 8: Seed Data

### Problem: No users to log in with

**Fix:** Run this SQL to create an admin user:
```sql
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (uuid, email, password_hash, full_name, role, status)
VALUES (
    gen_random_uuid(),
    'admin@altura.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxNZJvNkNzWUw.8pLqJYzOEfF2e',
    'Admin Principal',
    'admin',
    'active'
);
```

Or register via the frontend at `http://localhost:5173/register`.

---

## Quick Diagnostic Checklist

| Symptom | Check |
|---|---|
| Backend won't start | Docker running? Database exists? `.env` complete? |
| `InvalidRequestError` | back_populates pairs match? |
| `ColumnType` errors | explicit `Integer`/`Boolean` on all columns? |
| `Decimal` import error | replaced with `Numeric`? |
| `JSONB` import error | replaced with `JSON`? |
| bcrypt error | using direct bcrypt, NOT passlib? |
| Frontend blank page | `AuthProvider` in `main.tsx`? |
| API 500 errors | backend logs? database connection? |
| CORS errors | `ALLOWED_ORIGINS` in `.env` includes frontend URL? |
| `bcrypt` 5.0.0 error | pinned to `<5.0.0` in `pyproject.toml`? |

---

## Restart Everything

```bash
# 1. Docker
docker compose up -d

# 2. Database
psql -U postgres -d gestor_aph -f init_schema.sql

# 3. Backend
cd backend && python -m uvicorn src.main:app --reload --port 8000

# 4. Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.
