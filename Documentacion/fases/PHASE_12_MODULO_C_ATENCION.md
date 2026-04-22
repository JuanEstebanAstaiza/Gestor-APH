# Phase 12 — Modulo C: Atencion y Comunicacion (FAQ/PQRS)

## Estado: COMPLETADA

## Resumen de completado
Todos los deliverables fueron creados siguiendo los patrones existentes del codebase:
- Models: SQLAlchemy 2.0 style con enums para PQRS
- Schemas: Pydantic con from_attributes + FAQSearchResponse con model_rebuild
- Services: SessionLocal desde main.py, email MVP: logging
- Routers: registrados en main.py con prefixes /api/pqrs, /api/faq, /api/circulars, /api/communications
- Frontend: inline styles temporarios (Fase 16), TanStack Query, axios
- Enums nuevos: `pqrs_type`, `pqrs_status`, `pqrs_priority`

## Objetivo
Implementar el módulo de atención al residente: FAQ, PQRS, circulares, comunicaciones.

## Especificaciones (ListaDeLaVerdad.md — Sección C)
- Asistente FAQ: respuesta automática para dudas frecuentes
- PQRS Automatizado: radicación, clasificación temática, seguimiento
- Circulares y Avisos: envío masivo segmentado (por torre/tipo de residente)
- Llamados de Atención: generación automática basada en reportes de infracciones

## Schema changes (agregar a `init_schema.sql`)

### Tabla: `pqrs`
```sql
CREATE TABLE IF NOT EXISTS pqrs (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    requester_id INTEGER NOT NULL REFERENCES census_residents(id),
    type VARCHAR(20) NOT NULL,  -- petición, queja, reclamo, sugerencia
    category VARCHAR(50),  -- financiero, convivencia, tecnico, seguridad, otros
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',  -- open, in_progress, resolved, closed, dismissed
    priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent
    assigned_to INTEGER REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    response TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `pqrs_attachments`
```sql
CREATE TABLE IF NOT EXISTS pqrs_attachments (
    id SERIAL PRIMARY KEY,
    pqrs_id INTEGER NOT NULL REFERENCES pqrs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `faq_entries`
```sql
CREATE TABLE IF NOT EXISTS faq_entries (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50),
    keywords TEXT[],  -- array de keywords para búsqueda
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `circulars`
```sql
CREATE TABLE IF NOT EXISTS circulars (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_type VARCHAR(50),  -- all, owners, tenants, specific_tower
    target_value TEXT,  -- JSON string for complex targeting
    status VARCHAR(20) DEFAULT 'draft',  -- draft, sent, scheduled
    sent_at TIMESTAMPTZ,
    sent_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `communications`
```sql
CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES census_residents(id),
    type VARCHAR(20) NOT NULL,  -- email, whatsapp, notification, circular
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, failed
    sent_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend deliverables
- `schemas/communication.py` — Pydantic schemas para PQRS, FAQ, circulares
- `routers/pqrs.py` — CRUD de PQRS
- `routers/faq.py` — CRUD y búsqueda de FAQ
- `routers/circulars.py` — gestión de circulares
- `services/communication_service.py` — lógica de PQRS, FAQ, circulares
- `services/email_service.py` — servicio de email (MVP: logging)

## Frontend deliverables
- `pages/communication/PQRSForm.tsx` — formulario de PQRS
- `pages/communication/PQRSList.tsx` — listado y seguimiento de PQRS
- `pages/communication/FAQAdmin.tsx` — admin de FAQ
- `pages/communication/FAQView.tsx` — vista de FAQ para residentes
- `pages/communication/CircularDashboard.tsx` — gestión de circulares
- `pages/communication/CommunicationHistory.tsx` — historial de comunicaciones

## Decisiones técnicas
- **NO Alembic** — agregar tablas a `init_schema.sql` directamente
- **FAQ keywords: TEXT[]** — PostgreSQL native array para búsqueda por keywords
- **Email MVP: logging** — integrar con SMTP cuando se necesite
- **WhatsApp: pending** — no implementar en MVP, dejar endpoint preparado

## Checklist
- [x] Agregar tablas a `init_schema.sql` (pqrs, pqrs_attachments, faq_entries, circulars, communications + enums)
- [x] Crear `models/communication.py` (PQRS, PQRSAttachment, FAQEntry, Circular, Communication)
- [x] Crear `schemas/communication.py` (PQRSCreate/Update/Out, FAQCreate/Update/Out/FAQSearchResponse, CircularCreate/Update/Out, CommunicationOut)
- [x] Crear `services/communication_service.py` (create_pqrs, update_pqrs_status, search_faq, create_circular, send_circular, send_communication)
- [x] Crear `services/email_service.py` (send_email, send_bulk_email, send_whatsapp — MVP: logging)
- [x] Crear `routers/pqrs.py` (CRUD PQRS + assign)
- [x] Crear `routers/faq.py` (search, CRUD FAQ)
- [x] Crear `routers/circulars.py` (CRUD + send circular)
- [x] Crear `routers/communications.py` (list + send communication)
- [x] Registrar todos los routers en `main.py`
- [x] Crear types en `frontend/src/types/index.ts`
- [x] Crear `pages/communication/PQRSForm.tsx`
- [x] Crear `pages/communication/PQRSList.tsx` (con modal detalle)
- [x] Crear `pages/communication/FAQAdmin.tsx` (con search)
- [x] Crear `pages/communication/FAQView.tsx` (vista resident)
- [x] Crear `pages/communication/CircularDashboard.tsx`
- [x] Crear `pages/communication/CommunicationHistory.tsx`
- [x] Actualizar `GuiaDeContinuidad.md` con estado de Fase 12
