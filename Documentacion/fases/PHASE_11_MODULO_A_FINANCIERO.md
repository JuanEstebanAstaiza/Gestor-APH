# Phase 11 — Modulo A: Gestión Financiera y Cobranza

## Estado: COMPLETADA

## Resumen de completado
Todos los deliverables fueron creados siguiendo los patrones existentes del codebase:
- Models: SQLAlchemy 2.0 style (Mapped, mapped_column) con enums
- Schemas: Pydantic con from_attributes
- Services: SessionLocal desde main.py, balance computed on-demand
- Routers: registrado en main.py con prefix `/api/finance`
- Frontend: inline styles temporarios (Fase 16), TanStack Query, axios
- Enums nuevos: `invoice_status`, `payment_status`

## Objetivo
Implementar el módulo financiero completo: cuentas de cobro, pagos, balance, paz y salvo.

## Especificaciones (ListaDeLaVerdad.md — Sección A)
- Cargue de información desde sistemas contables externos
- Generación automática y envío masivo de facturas mensuales
- Notificación de morosos
- Bloqueo de reservas para unidades con mora
- Paz y salvo automático descargable
- Consulta de estado para residentes (autogestión)

## Schema changes (agregar a `init_schema.sql`)

### Tabla: `invoices`
```sql
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    period VARCHAR(7) NOT NULL,  -- YYYY-MM
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, paid, overdue, cancelled
    due_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    generated_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `payments`
```sql
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50),  -- bank_transfer, cash, check, other
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL,
    processed_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, verified, rejected
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `balance_records`
```sql
CREATE TABLE IF NOT EXISTS balance_records (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    period VARCHAR(7) NOT NULL,  -- YYYY-MM
    total_due NUMERIC(12,2) NOT NULL,
    total_paid NUMERIC(12,2) NOT NULL,
    balance NUMERIC(12,2) NOT NULL,
    months_overdue INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tabla: `accounts`
```sql
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    account_type VARCHAR(50),  -- savings, checking, other
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend deliverables
- `schemas/finance.py` — Pydantic schemas para invoices, payments, balance
- `routers/finance.py` — CRUD + endpoints de cobro
- `services/finance_service.py` — lógica de generación de facturas, calculo de balance, paz y salvo
- `services/notification_service.py` — notificaciones de morosos

## Frontend deliverables
- `pages/finance/InvoiceDashboard.tsx` — listado y gestión de facturas
- `pages/finance/PaymentHistory.tsx` — historial de pagos
- `pages/finance/BalanceView.tsx` — consulta de balance por residente
- `pages/finance/PazYSalvo.tsx` — generación de paz y salvo
- `pages/finance/ImportData.tsx` — importación de datos contables

## Decisiones técnicas
- **NO Alembic** — agregar tablas a `init_schema.sql` directamente
- **Period format: YYYY-MM** — estandarizar periodos de facturación
- **Balance computed on-demand** — no materializar en tabla, calcular desde invoices + payments

## Checklist
- [x] Agregar tablas a `init_schema.sql` (accounts, invoices, payments, balance_records + enums)
- [x] Crear `models/finance.py` (Account, Invoice, Payment, BalanceRecord)
- [x] Crear `schemas/finance.py` (AccountCreate/Update/Out, InvoiceCreate/Update/Out, PaymentCreate/Out, BalanceOut, PazYSalvoOut)
- [x] Crear `services/finance_service.py` (generate_invoices, process_payment, get_balance, paz_y_salvo, financial_report)
- [x] Crear `services/notification_service.py` (notify_overdue_residents)
- [x] Crear `routers/finance.py` (CRUD accounts/invoices/payments, balance, paz-y-salvo, report, notify)
- [x] Registrar router en `main.py` con prefix `/api/finance`
- [x] Crear types en `frontend/src/types/index.ts`
- [x] Crear `pages/finance/InvoiceDashboard.tsx`
- [x] Crear `pages/finance/PaymentHistory.tsx`
- [x] Crear `pages/finance/BalanceView.tsx`
- [x] Crear `pages/finance/PazYSalvo.tsx`
- [x] Crear `pages/finance/ImportData.tsx`
- [x] Actualizar `GuiaDeContinuidad.md` con estado de Fase 11
