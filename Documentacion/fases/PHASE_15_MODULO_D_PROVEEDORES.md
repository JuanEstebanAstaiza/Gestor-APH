# Phase 15 — Modulo D: Directorio de Proveedores

## Estado: COMPLETADA

## Objetivo
Implementar el directorio de proveedores y sistema de alertas de mantenimiento.

## Especificaciones (ListaDeLaVerdad.md — Sección D)
- Base de datos básica de técnicos y empresas con contacto y especialidad
- Alertas de vencimiento de fechas de mantenimiento preventivo
- Alertas de vencimiento de contratos

## Schema changes (agregar a `init_schema.sql`)

### Tabla: `providers`
```sql
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type provider_type NOT NULL,
    specialty VARCHAR(100),
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `provider_contracts`
```sql
CREATE TABLE IF NOT EXISTS provider_contracts (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    contract_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    value NUMERIC(12,2),
    status contract_status DEFAULT 'active',
    renewal_notice_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `maintenance_alerts`
```sql
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    provider_id INTEGER REFERENCES providers(id),
    alert_type alert_type NOT NULL,
    description TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    status alert_status DEFAULT 'pending',
    notified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notified_to INTEGER REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums creadas
- `provider_type` — empresa, independiente
- `contract_status` — active, expired, terminated, pending
- `alert_type` — maintenance, contract_expiry, warranty_expiry
- `alert_status` — pending, notified, completed, dismissed

## Backend deliverables
- `schemas/provider.py` — Pydantic schemas para providers, contracts, alerts
- `routers/providers.py` — CRUD de proveedores
- `routers/maintenance.py` — CRUD de alertas de mantenimiento
- `services/provider_service.py` — lógica de proveedores + contratos
- `services/alert_service.py` — generación y notificación de alertas

## Frontend deliverables
- `pages/providers/ProviderList.tsx` — listado de proveedores
- `pages/providers/ProviderForm.tsx` — formulario de proveedor
- `pages/providers/ContractView.tsx` — visualización de contratos
- `pages/maintenance/AlertDashboard.tsx` — dashboard de alertas
- `pages/maintenance/AlertForm.tsx` — formulario de alerta
- `pages/maintenance/MaintenanceCalendar.tsx` — calendario de mantenimiento

## Decisiones técnicas
- **NO Alembic** — agregar tablas a `init_schema.sql` directamente
- **Alert type: enum** — maintenance/contract_expiry/warranty_expiry
- **renewal_notice_days** — configurable por contrato para alertas anticipadas
- **Provider specialty: free text** — no enum para flexibilidad
- **Contracts no tienen asset_id** — se vinculan solo al provider

## Checklist
- [x] Agregar tablas a `init_schema.sql`
- [x] Crear `schemas/provider.py`
- [x] Crear `services/provider_service.py`
- [x] Crear `services/alert_service.py`
- [x] Crear `routers/providers.py`
- [x] Crear `routers/maintenance.py`
- [x] Crear `pages/providers/ProviderList.tsx`
- [x] Crear `pages/providers/ProviderForm.tsx`
- [x] Crear `pages/providers/ContractView.tsx`
- [x] Crear `pages/maintenance/AlertDashboard.tsx`
- [x] Crear `pages/maintenance/AlertForm.tsx`
- [x] Crear `pages/maintenance/MaintenanceCalendar.tsx`
- [x] Actualizar `GuiaDeContinuidad.md` con estado de Fase 15
- [x] Actualizar `CLAUDE.md` con estado y estructura actualizada
