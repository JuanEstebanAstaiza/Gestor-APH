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

## 2. Estado actual del proyecto

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

## 3. Poner en marcha (primer paso obligatorio)

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

### Fase 10: Services y Tasks (Backend)
Crear:
- `backend/src/services/auth_service.py` — logica de auth avanzada (forgot password, token rotation)
- `backend/src/services/file_service.py` — cloud storage (S3/R2), signed URLs
- `backend/src/services/document_service.py` — auto-classification, search index
- `backend/src/services/census_service.py` — aggregation, statistics
- `backend/src/tasks/auto_classify.py` — scheduled classification

### Fase 11: Modulo A — Gestion Financiera
- Tablas: `payments`, `invoices`, `accounts`, `balance_records`
- Routers: `/api/finance/invoices`, `/api/finance/payments`, `/api/finance/balance`
- Frontend: paginas de cuentas de cobro, estado de cartera, paz y salvo
- Importacion de datos contables

### Fase 12: Modulo C — Atencion y Comunicacion
- Tablas: `pqrs`, `faq_entries`, `circulars`, `communications`
- Routers: `/api/pqrs`, `/api/faq`, `/api/circulars`
- Servicio de email/WhatsApp
- Frontend: modulo PQRS, FAQ admin, envio de circulares

### Fase 13: Modulo G — Reservas y Convivencia
- Tablas: `reservations`, `infractions`, `regulations`
- Routers: `/api/reservations`, `/api/infractions`
- Calendario de areas comunes
- Validacion de cartera para reservas
- Frontend: calendario de reservas, modulo de sanciones

### Fase 14: Modulo F — Asambleas y Consejo
- Tablas: `assemblies`, `votes`, `agendas`, `minutes`
- Routers: `/api/assemblies`, `/api/votes`
- Quorum tracking, votacion digital
- Frontend: gestion de asambleas, repositorio de actas

### Fase 15: Modulo D — Directorio de Proveedores
- Tablas: `providers`, `maintenance_alerts`
- Routers: `/api/providers`, `/api/maintenance`
- Alertas de vencimiento de contratos/mantenimiento
- Frontend: directorio de proveedores, dashboard de alertas

### Fase 16: UI/UX refinamiento
- Tema visual completo (no inline styles)
- Sidebar con navegacion real por modulo
- Formularios completos con validacion
- Pagination UI en DataTable
- Loading states, error handling
- Responsive design

### Fase 17: Testing completo
- Tests de auth (login, refresh, logout, token expiry)
- Tests de permissions (acceso por rol)
- Tests de CRUD (users, census, assets, documents)
- Tests de document upload/share
- Tests de frontend (components, hooks)

### Fase 18: Docker production
- Dockerfile para backend y frontend
- docker-compose con backend + frontend + postgres
- Health checks, restart policies
- Environment configs

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

## 9. Proximo agente: Fase 10

El siguiente agente debe trabajar en **Fase 10: Services y Tasks**:

Crear 4 archivos en `backend/src/services/` y 1 en `backend/src/tasks/`:

1. **`backend/src/services/auth_service.py`**
   - `forgot_password(email)`: genera token, envia email
   - `reset_password(token, new_password)`: valida token, actualiza password
   - `generate_admin_seed()`: crea usuario admin inicial si no existe

2. **`backend/src/services/file_service.py`**
   - `upload_file(file)`: upload a S3/R2 (MVP: filesystem local)
   - `get_signed_url(path, expiry)`: signed URL para download
   - `delete_file(path)`: removal de archivo

3. **`backend/src/services/document_service.py`**
   - `auto_classify(document)`: clasificacion por keywords/titulo
   - `smart_search(query, user_id)`: busqueda con filtros
   - `generate_share_token(document)`: token de compartimiento

4. **`backend/src/services/census_service.py`**
   - `get_census_stats()`: resumen del censo
   - `get_asset_occupants(asset_id)`: ocupantes de un activo
   - `export_census()`: export CSV del censo

5. **`backend/src/tasks/auto_classify.py`**
   - Funcion para ejecucion periodic de auto-classification
   - Usa APScheduler o cron-like

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
