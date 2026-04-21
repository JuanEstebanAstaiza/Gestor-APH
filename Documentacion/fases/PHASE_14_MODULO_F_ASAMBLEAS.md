# Phase 14 — Modulo F: Asambleas y Consejo

## Estado: PENDIENTE

## Objetivo
Implementar el módulo de asambleas, votaciones, actas y seguimiento de tareas.

## Especificaciones (ListaDeLaVerdad.md — Sección F)
- Gestión de convocatorias y confirmación de asistencia
- Quórum y votación digital
- Repositorio de actas con trazabilidad
- Seguimiento de tareas asignadas al consejo o administración

## Schema changes (agregar a `init_schema.sql`)

### Tabla: `assemblies`
```sql
CREATE TABLE IF NOT EXISTS assemblies (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,  -- ordinaria, extraordinaria, especial
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',  -- draft, announced, in_progress, completed, cancelled
    quorum_required INTEGER DEFAULT 0,  -- percentage
    quorum_achieved BOOLEAN DEFAULT FALSE,
    announced_at TIMESTAMPTZ,
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `agendas`
```sql
CREATE TABLE IF NOT EXISTS agendas (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    description TEXT,
    presenter INTEGER REFERENCES users(id),
    order INTEGER NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `assembly_attendance`
```sql
CREATE TABLE IF NOT EXISTS assembly_attendance (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed, declined, absent
    confirmed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `votes`
```sql
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    agenda_item_id INTEGER REFERENCES agendas(id) ON DELETE CASCADE,
    voter_id INTEGER NOT NULL REFERENCES census_residents(id),
    option VARCHAR(50) NOT NULL,  -- favor, en_contra, abstencion
    notes TEXT,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tabla: `minutes`
```sql
CREATE TABLE IF NOT EXISTS minutes (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(500),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `task_followups`
```sql
CREATE TABLE IF NOT EXISTS task_followups (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    assembly_id INTEGER REFERENCES assemblies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    deadline DATE,
    status VARCHAR(20) DEFAULT 'open',  -- open, in_progress, completed, overdue, dismissed
    completed_at TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend deliverables
- `schemas/assembly.py` — Pydantic schemas para asambleas, agendas, attendance, votes, minutes
- `schemas/task.py` — Pydantic schemas para task followups
- `routers/assemblies.py` — CRUD + convocatorias + quorum tracking
- `routers/tasks.py` — CRUD de task followups
- `services/assembly_service.py` — lógica de asambleas + quorum + votación
- `services/task_service.py` — lógica de seguimiento de tareas

## Frontend deliverables
- `pages/assemblies/AssemblyList.tsx` — listado de asambleas
- `pages/assemblies/AssemblyDetail.tsx` — detalle de asamblea
- `pages/assemblies/AgendaBuilder.tsx` — builder de agenda
- `pages/assemblies/AttendanceTracker.tsx` — tracker de asistencia/quórum
- `pages/assemblies/VoteForm.tsx` — formulario de votación
- `pages/assemblies/MinutesView.tsx` — visualización de actas
- `pages/assemblies/TaskList.tsx` — listado de tareas asignadas
- `pages/assemblies/TaskDetail.tsx` — detalle de tarea

## Decisiones técnicas
- **NO Alembic** — agregar tablas a `init_schema.sql` directamente
- **Quorum: percentage** — calcular quórum dinámicamente desde attendance
- **Vote options: fixed** — favor/en_contra/abstencion (no free text para voting)
- **Minutes versioning** — track versions con file_path update

## Checklist
- [ ] Agregar tablas a `init_schema.sql`
- [ ] Crear `schemas/assembly.py`
- [ ] Crear `schemas/task.py`
- [ ] Crear `services/assembly_service.py`
- [ ] Crear `services/task_service.py`
- [ ] Crear `routers/assemblies.py`
- [ ] Crear `routers/tasks.py`
- [ ] Crear `pages/assemblies/AssemblyList.tsx`
- [ ] Crear `pages/assemblies/AssemblyDetail.tsx`
- [ ] Crear `pages/assemblies/AgendaBuilder.tsx`
- [ ] Crear `pages/assemblies/AttendanceTracker.tsx`
- [ ] Crear `pages/assemblies/VoteForm.tsx`
- [ ] Crear `pages/assemblies/MinutesView.tsx`
- [ ] Crear `pages/assemblies/TaskList.tsx`
- [ ] Crear `pages/assemblies/TaskDetail.tsx`
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 14
