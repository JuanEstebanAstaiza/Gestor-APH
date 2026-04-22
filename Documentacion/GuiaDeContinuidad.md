# Guia de Continuidad — Gestor APH

## Instrucciones para el siguiente agente

Este documento es la guia para que un agente continue el desarrollo del proyecto **Gestor APH** desde donde se dejo.

---

## 1. Leer primero

Antes de hacer cualquier cambio, lee estos dos archivos en orden:

### A. `Documentacion/ListaDeLaVerdad.md`
Especificaciones completas del producto. Contiene 8 modulos (A-H) con todos los requisitos funcionales:
- A: Gestion Financiera y Cobranza
- B: Gestion de Residentes
- C: Atencion y Comunicacion (FAQ/PQRS)
- D: Directorio de Proveedores
- E: Gestion Documental
- F: Asambleas y Consejo
- G: Reservas y Convivencia
- H: Control de Acceso y Configuracion

### B. `README.md` (raiz del proyecto)
Overview tecnico del stack y setup.

---

## 2. Estado de fases

| Fase | Nombre | Estado | Archivo |
|------|--------|--------|---------|
| 10 | Services y Tasks | COMPLETADA | [PHASE_10_SERVICES_AND_TASKS.md](fases/PHASE_10_SERVICES_AND_TASKS.md) |
| 11 | Modulo A — Gestion Financiera | COMPLETADA | [PHASE_11_MODULO_A_FINANCIERO.md](fases/PHASE_11_MODULO_A_FINANCIERO.md) |
| 12 | Modulo C — Atencion y Comunicacion | PENDIENTE | [PHASE_12_MODULO_C_ATENCION.md](fases/PHASE_12_MODULO_C_ATENCION.md) |
| 13 | Modulo G — Reservas y Convivencia | PENDIENTE | [PHASE_13_MODULO_G_RESERVAS.md](fases/PHASE_13_MODULO_G_RESERVAS.md) |
| 14 | Modulo F — Asambleas y Consejo | PENDIENTE | [PHASE_14_MODULO_F_ASAMBLEAS.md](fases/PHASE_14_MODULO_F_ASAMBLEAS.md) |
| 15 | Modulo D — Directorio de Proveedores | PENDIENTE | [PHASE_15_MODULO_D_PROVEEDORES.md](fases/PHASE_15_MODULO_D_PROVEEDORES.md) |
| 16 | UI/UX Refinement | PENDIENTE | [PHASE_16_UI_UX.md](fases/PHASE_16_UI_UX.md) |
| 17 | Testing Completo | PENDIENTE | [PHASE_17_TESTING.md](fases/PHASE_17_TESTING.md) |
| 18 | Docker Production | PENDIENTE | [PHASE_18_DOCKER_PRODUCTION.md](fases/PHASE_18_DOCKER_PRODUCTION.md) |

---

## 3. Estado actual del proyecto

El proyecto tiene **codigo base completo** pero **NO esta en marcha**:

```
Gestor APH/
├── backend/                          [CREADO]
│   ├── pyproject.toml                [OK]
│   ├── .env.example                  [OK]
│   ├── README.md                     [OK]
│   ├── alembic.ini                   [EXISTE — NO USAR]
│   ├── alembic/
│   │   ├── env.py                    [EXISTE — NO USAR]
│   │   ├── script.py.mako            [EXISTE — NO USAR]
│   │   └── versions/
│   │       └── 001_initial_schema.py [EXISTE — NO USAR]
│   └── src/
│       ├── main.py                   [OK]
│       ├── config.py                 [OK]
│       ├── dependencies.py           [OK]
│       ├── core/
│       │   ├── security.py           [OK]
│       │   ├── permissions.py        [OK]
│       │   └── exceptions.py         [OK]
│       ├── models/                   [OK — 10 archivos ORM]
│       ├── schemas/                  [OK — 9 archivos Pydantic]
│       ├── routers/                  [OK — 9 routers]
│       ├── services/                 [VACIO — crear en Fase 10]
│       ├── tasks/                    [VACIO — crear en Fase 10]
│       └── tests/
│           ├── conftest.py           [OK]
│           └── test_auth.py          [OK]
├── frontend/                         [CREADO]
│   ├── package.json                  [OK]
│   ├── tsconfig.json                 [OK]
│   ├── vite.config.ts                [OK]
│   ├── index.html                    [OK]
│   ├── README.md                     [OK]
│   └── src/
│       ├── main.tsx                  [OK]
│       ├── App.tsx                   [OK]
│       ├── index.css                 [OK]
│       ├── hooks/                    [OK — useAuth, useApi, usePermissions]
│       ├── lib/                      [OK — api, constants, utils]
│       ├── store/                    [OK — authStore]
│       ├── styles/                   [OK — theme.css]
│       ├── types/                    [OK — index.ts]
│       ├── components/common/        [OK — Layout, Sidebar, Header, DataTable, FileUpload, SearchBar]
│       ├── pages/                    [OK — 20+ paginas]
│       └── tests/                    [VACIO]
├── docker-compose.yml                [OK]
├── .env.example                      [OK]
└── README.md                         [OK]
```

**Lo que falta:**
- `backend/src/services/` — vacio (crear en Fase 10)
- `backend/src/tasks/` — vacio (crear en Fase 10)
- `frontend/tests/` — vacio
- **Dependencias instaladas** — NO
- **Base de datos levantada** — NO
- **Schema migrado** — NO
- **Servidores corriendo** — NO

---

## 4. Poner en marcha (primer paso obligatorio)

El siguiente agente DEBE ejecutar estos pasos antes de cualquier desarrollo:

### Paso 1: Iniciar PostgreSQL
```bash
docker compose up -d
```

### Paso 2: Configurar backend
```bash
cd backend
uv pip install -e ".[dev]"
cp .env.example .env
```

Editar `.env` y configurar:
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestor_aph`
- `JWT_SECRET_KEY=<generar un secret random>`

### Paso 3: Crear schema via SQL directo
```bash
docker exec -i gestoraph-postgres-1 psql -U postgres -d gestor_aph < backend/init_schema.sql
```
> **IMPORTANTE:** NO usar `alembic upgrade head`. Alembic NO se usa por problemas de compatibilidad con Windows/Python 3.12. El schema se gestiona con `init_schema.sql` directamente.

### Paso 4: Verificar backend
```bash
uvicorn src.main:app --reload --port 8000
```

Probar endpoint: `curl http://localhost:8000/health` debe retornar `{"status":"ok"}`

### Paso 5: Iniciar frontend
```bash
cd frontend
npm install
npm run dev
```

### Paso 6: Verificar frontend
Abrir `http://localhost:5173` — debe mostrar la pagina de Login.

---

## 4. Plan de desarrollo por fases

### Sistema de tracking de fases
Cada fase tiene un archivo detallado en `Documentacion/fases/PHASE_XX_NOMBRE.md` con:
- Schema SQL exacto a agregar
- Backend deliverables (schemas, services, routers)
- Frontend deliverables (componentes)
- Decisiones técnicas
- Checklist de completado

### Fase 10: Services y Tasks (Backend)
**Estado: PENDIENTE** — Ver [PHASE_10_SERVICES_AND_TASKS.md](fases/PHASE_10_SERVICES_AND_TASKS.md)
- `backend/src/services/auth_service.py` — forgot password, token rotation, admin seed
- `backend/src/services/file_service.py` — cloud storage (MVP: filesystem local)
- `backend/src/services/document_service.py` — auto-classification, search, share tokens
- `backend/src/services/census_service.py` — stats, export, profile
- `backend/src/tasks/auto_classify.py` — scheduled classification
- Background task en `main.py`

### Fase 11: Modulo A — Gestion Financiera
**Estado: PENDIENTE** — Ver [PHASE_11_MODULO_A_FINANCIERO.md](fases/PHASE_11_MODULO_A_FINANCIERO.md)
- Tablas: `invoices`, `payments`, `balance_records`, `accounts`
- Routers: `/api/finance/invoices`, `/api/finance/payments`, `/api/finance/balance`
- Services: `finance_service.py`, `notification_service.py`
- Frontend: InvoiceDashboard, PaymentHistory, BalanceView, PazYSalvo, ImportData

### Fase 12: Modulo C — Atencion y Comunicacion
**Estado: PENDIENTE** — Ver [PHASE_12_MODULO_C_ATENCION.md](fases/PHASE_12_MODULO_C_ATENCION.md)
- Tablas: `pqrs`, `pqrs_attachments`, `faq_entries`, `circulars`, `communications`
- Routers: `/api/pqrs`, `/api/faq`, `/api/circulars`
- Services: `communication_service.py`, `email_service.py`
- Frontend: PQRSForm, PQRSList, FAQAdmin, FAQView, CircularDashboard

### Fase 13: Modulo G — Reservas y Convivencia
**Estado: PENDIENTE** — Ver [PHASE_13_MODULO_G_RESERVAS.md](fases/PHASE_13_MODULO_G_RESERVAS.md)
- Tablas: `reservations`, `infractions`, `regulations`
- Routers: `/api/reservations`, `/api/infractions`
- Services: `reservation_service.py`, `infraction_service.py`
- Frontend: CalendarView, ReservationForm, InfractionList, RegulationView

### Fase 14: Modulo F — Asambleas y Consejo
**Estado: PENDIENTE** — Ver [PHASE_14_MODULO_F_ASAMBLEAS.md](fases/PHASE_14_MODULO_F_ASAMBLEAS.md)
- Tablas: `assemblies`, `agendas`, `assembly_attendance`, `votes`, `minutes`, `task_followups`
- Routers: `/api/assemblies`, `/api/tasks`
- Services: `assembly_service.py`, `task_service.py`
- Frontend: AssemblyList, AssemblyDetail, AgendaBuilder, AttendanceTracker, VoteForm, MinutesView, TaskList

### Fase 15: Modulo D — Directorio de Proveedores
**Estado: PENDIENTE** — Ver [PHASE_15_MODULO_D_PROVEEDORES.md](fases/PHASE_15_MODULO_D_PROVEEDORES.md)
- Tablas: `providers`, `provider_contracts`, `maintenance_alerts`
- Routers: `/api/providers`, `/api/maintenance`
- Services: `provider_service.py`, `alert_service.py`
- Frontend: ProviderList, ProviderForm, ContractView, AlertDashboard, MaintenanceCalendar

### Fase 16: UI/UX refinamiento
**Estado: PENDIENTE** — Ver [PHASE_16_UI_UX.md](fases/PHASE_16_UI_UX.md)
- Tema CSS completo con variables (eliminar inline styles)
- Sidebar con navegación real por módulo
- Formularios completos con validación
- Pagination UI en DataTable
- Responsive design mobile-first
- Component library: Button, Input, Modal, Toast, Badge

### Fase 17: Testing completo
**Estado: PENDIENTE** — Ver [PHASE_17_TESTING.md](fases/PHASE_17_TESTING.md)
- Backend: pytest — auth, permissions, CRUD, services
- Frontend: Vitest — components, hooks, pages
- Coverage target: 70%

### Fase 18: Docker production
**Estado: PENDIENTE** — Ver [PHASE_18_DOCKER_PRODUCTION.md](fases/PHASE_18_DOCKER_PRODUCTION.md)
- Dockerfiles multi-stage para backend y frontend
- docker-compose.production.yml con health checks
- nginx para frontend serve
- Environment configs para production

---

## 5. Decisiones arquitectonicas clave (NO cambiar)

| Decision | Razon |
|----------|-------|
| Single-tenant MVP | Sin `property_id` en todas las tablas. Si se necesita multi-tenant despues, se agrega una tabla `properties` y se cascada. |
| UUID externo + SERIAL interno | JWT claims usan UUID, FKs internos usan SERIAL para performance. |
| Soft deletes | Compliance legal requiere trazabilidad. `is_active` flag en todas las tablas. |
| Cloud storage | Archivos en S3/R2, DB solo guarda paths. MVP usa filesystem local. |
| RBAC via JWT claim | Roles fijos: admin(4), consejo(3), vigilancia(2), residente(1). |
| TanStack Query + Zustand | Server state con React Query, global state con Zustand. |
| FastAPI + SQLAlchemy 2.0 | ORM con SQLAlchemy 2.0 style (Mapped, mapped_column). |
| **SQL directo (NO Alembic)** | Schema via `init_schema.sql`. Alembic NO se usa por incompatibilidad con Windows/Python 3.12. Cualquier cambio de schema se hace editando `init_schema.sql` y re-aplicando. |
| uv para Python | Package manager y runner. |
| Vite para frontend | Build tool, HMR, proxy API. |

---

## 6. Matrix de permisos (referencia rapida)

| Endpoint group | Admin | Consejo | Vigilancia | Residente |
|----------------|-------|---------|------------|-----------|
| /auth/* | Y | Y | Y | Y |
| /users | Y | N | N | N |
| /users/me | Y | Y | Y | Y |
| /visitors | Y | Y | Y | Y (own) |
| /authorizations | Y | Y | Y | Y (own) |
| /census | Y | Y | N | N |
| /census/residents/me | Y | Y | N | Y |
| /assets | Y | Y | N | N |
| /documents | Y | Y | Y | Y (own) |
| /documents/upload | Y | Y | Y | Y |
| /documents/search | Y | Y | Y | Y |
| /categories | Y | Y | Y | Y |
| /audit | Y | Y | N | N |

---

## 7. Checklist para el siguiente agente

- [ ] Leer `Documentacion/ListaDeLaVerdad.md`
- [ ] Leer `README.md`
- [ ] Leer este archivo (`GuiaDeContinuidad.md`)
- [ ] `docker compose up -d`
- [ ] `cd backend && uv pip install -e ".[dev]"`
- [ ] Configurar `.env`
- [ ] `docker exec -i gestoraph-postgres-1 psql -U postgres -d gestor_aph < backend/init_schema.sql` (NO usar alembic)
- [ ] `uvicorn src.main:app --reload --port 8000` — verificar `/health`
- [ ] `cd frontend && npm install && npm run dev`
- [ ] Verificar Login page en `localhost:5173`
- [ ] Probar login con usuario admin (crear via SQL o endpoint)
- [ ] Continuar con **Fase 10** (services y tasks)

---

## 8. Nota sobre schema y migrations

**Alembic NO se utiliza.** Cualquier cambio de schema debe:
1. Editar `backend/init_schema.sql` con las nuevas tablas/columnas
2. Ejecutar: `docker exec -i gestoraph-postgres-1 psql -U postgres -d gestor_aph < backend/init_schema.sql`
3. Actualizar los models/schemas correspondientes en el backend

**Cada fase documenta el SQL exacto a agregar en su archivo `PHASE_XX_NOMBRE.md`.**

## 9. Proximo agente: Fase 10

El siguiente agente debe trabajar en **Fase 10: Services y Tasks**.

Lee el archivo detallado: **[PHASE_10_SERVICES_AND_TASKS.md](fases/PHASE_10_SERVICES_AND_TASKS.md)**

Este archivo contiene:
- Schema SQL exacto (si hay nuevos campos)
- Funciones exactas para cada service
- Decisiones técnicas específicas
- Checklist de completado

---

## 10. Notas importantes

- **NO borrar codigo existente** — todo el codigo base es funcional
- **NO cambiar el schema** — las tablas estan definidas en `init_schema.sql`
- **NO cambiar el stack** — FastAPI + React + PostgreSQL
- **NO agregar dependencias nuevas** sin justificar
- **Los inline styles del frontend son temporarios** — se refactorizan en Fase 16
- **El upload de archivos es local (MVP)** — se migra a S3/R2 cuando file_service.py este listo
- **El email es opcional para MVP** — integrar cuando se necesite

---

*Este documento fue generado automaticamente al completar la infraestructura base del proyecto.*
*Fecha de generacion: 2026-04-21*
