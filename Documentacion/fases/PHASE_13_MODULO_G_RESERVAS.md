# Phase 13 — Modulo G: Reservas y Convivencia

## Estado: PENDIENTE

## Objetivo
Implementar el módulo de reservas de áreas comunes, infracciones y convivencia.

## Especificaciones (ListaDeLaVerdad.md — Sección G)
- Calendario de áreas comunes con validación de cartera
- Infracciones y sanciones con reincidencia
- Consulta del reglamento interactivo

## Schema changes (agregar a `init_schema.sql`)

### Tabla: `reservations`
```sql
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    area_type VARCHAR(50) NOT NULL,  -- bbq, salon, cancha, piscina, otros
    area_name VARCHAR(100) NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    guests_count INTEGER DEFAULT 0,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, cancelled, completed
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    balance_check BOOLEAN DEFAULT TRUE,  -- true = validated against debt
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `infractions`
```sql
CREATE TABLE IF NOT EXISTS infractions (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    category VARCHAR(50) NOT NULL,  -- ruido, mascotas, areas_comunes, estacionamiento, otros
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,  -- minor, moderate, severe
    warning_count INTEGER DEFAULT 0,
    fine_amount NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'open',  -- open, acknowledged, resolved, escalated
    issued_by INTEGER NOT NULL REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `regulations`
```sql
CREATE TABLE IF NOT EXISTS regulations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    section_number VARCHAR(50),
    chapter VARCHAR(100),
    order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend deliverables
- `schemas/reservation.py` — Pydantic schemas para reservas
- `schemas/infraction.py` — Pydantic schemas para infracciones
- `routers/reservations.py` — CRUD + calendario + balance check
- `routers/infractions.py` — CRUD de infracciones
- `services/reservation_service.py` — lógica de reservas + balance validation
- `services/infraction_service.py` — lógica de infracciones + reincidencia

## Frontend deliverables
- `pages/reservations/CalendarView.tsx` — calendario de reservas
- `pages/reservations/ReservationForm.tsx` — formulario de reserva
- `pages/reservations/ReservationList.tsx` — listado de reservas
- `pages/convivencia/InfractionList.tsx` — listado de infracciones
- `pages/convivencia/InfractionForm.tsx` — formulario de infracción
- `pages/convivencia/RegulationView.tsx` — reglamento interactivo

## Decisiones técnicas
- **NO Alembic** — agregar tablas a `init_schema.sql` directamente
- **Balance check before reservation** — validar cartera > threshold antes de aprobar
- **Severity escalation** — warning_count incrementa con reincidencia
- **Regulations: section_number** — permitir navegación por capítulos

## Checklist
- [ ] Agregar tablas a `init_schema.sql`
- [ ] Crear `schemas/reservation.py`
- [ ] Crear `schemas/infraction.py`
- [ ] Crear `services/reservation_service.py`
- [ ] Crear `services/infraction_service.py`
- [ ] Crear `routers/reservations.py`
- [ ] Crear `routers/infractions.py`
- [ ] Crear `pages/reservations/CalendarView.tsx`
- [ ] Crear `pages/reservations/ReservationForm.tsx`
- [ ] Crear `pages/reservations/ReservationList.tsx`
- [ ] Crear `pages/convivencia/InfractionList.tsx`
- [ ] Crear `pages/convivencia/InfractionForm.tsx`
- [ ] Crear `pages/convivencia/RegulationView.tsx`
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 13
