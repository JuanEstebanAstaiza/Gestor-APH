# GuiaDeContinuidad — Gestor APH

## Estado de Fases

| Fase | Nombre | Estado | Doc |
|------|--------|--------|-----|
| 10 | Services + Tasks | COMPLETADA | [PHASE_10_SERVICES_AND_TASKS.md](Documentacion/fases/PHASE_10_SERVICES_AND_TASKS.md) |
| 11 | Modulo A — Gestion Financiera | COMPLETADA | [PHASE_11_MODULO_A_FINANCIERO.md](Documentacion/fases/PHASE_11_MODULO_A_FINANCIERO.md) |
| 12 | Modulo C — Atencion y Comunicacion | COMPLETADA | [PHASE_12_MODULO_C_ATENCION.md](Documentacion/fases/PHASE_12_MODULO_C_ATENCION.md) |
| 13 | Modulo G — Reservas y Convivencia | COMPLETADA | [PHASE_13_MODULO_G_RESERVAS.md](Documentacion/fases/PHASE_13_MODULO_G_RESERVAS.md) |
| 14 | Modulo F — Asambleas y Consejo | COMPLETADA | [PHASE_14_MODULO_F_ASAMBLEAS.md](Documentacion/fases/PHASE_14_MODULO_F_ASAMBLEAS.md) |
| 15 | Modulo D — Directorio de Proveedores | COMPLETADA | [PHASE_15_MODULO_D_PROVEEDORES.md](Documentacion/fases/PHASE_15_MODULO_D_PROVEEDORES.md) |
| 16 | UI/UX refinement | COMPLETADA | [PHASE_16_UI_UX.md](Documentacion/fases/PHASE_16_UI_UX.md) |
| 17 | Testing | EN PROGRESO | [PHASE_17_TESTING.md](Documentacion/fases/PHASE_17_TESTING.md) · [Estado](Documentacion/fases/PHASE_17_TESTING_STATUS.md) |
| 18 | Docker production | PENDIENTE | [PHASE_18_DOCKER_PRODUCTION.md](Documentacion/fases/PHASE_18_DOCKER_PRODUCTION.md) |

## Resumen Fase 13 — Modulo G

### Deliverables backend
- `init_schema.sql` — Tablas: `reservations`, `infractions`, `regulations` + enums
- `models/reservation.py` — SQLAlchemy models: Reservation, Infraction, Regulation
- `schemas/reservation.py` — Pydantic schemas: ReservationCreate/Update/Out, InfractionCreate/Update/Out, RegulationCreate/Update/Out
- `services/reservation_service.py` — create_reservation (con balance check), approve, reject, cancel, calendar
- `services/infraction_service.py` — create_infraction (con reincidencia), acknowledge, resolve, list infractions, list regulations
- `routers/reservations.py` — CRUD + calendario + balance validation + infractions + regulations

### Deliverables frontend
- `types/index.ts` — Reservation, Infraction, Regulation interfaces
- `pages/reservations/CalendarView.tsx` — Calendario visual con navegacion por mes
- `pages/reservations/ReservationForm.tsx` — Formulario de reserva
- `pages/reservations/ReservationList.tsx` — Listado con filtros + acciones (aprobar/rechazar/cancelar)
- `pages/convivencia/InfractionList.tsx` — Listado de infracciones
- `pages/convivencia/InfractionForm.tsx` — Formulario de infraccion
- `pages/convivencia/RegulationView.tsx` — Reglamento interactivo por capitulos

### Decisiones clave
- Balance check: bloquea reservas si mora > 0 y months_overdue > 0
- Reincidencia: warning_count incrementa automaticamente al crear infraccion de misma categoria
- RBAC: consejo(3)+ aprueba/rechaza reservas e infracciones; admin(4)+ crea/edita reglamentos

## Resumen Fase 14 — Modulo F

### Deliverables backend
- `init_schema.sql` — Tablas: `assemblies`, `agendas`, `assembly_attendance`, `votes`, `minutes`, `task_followups` + enums
- `models/assembly.py` — SQLAlchemy models: Assembly, Agenda, Attendance, Vote, Minute, TaskFollowup
- `schemas/assembly.py` — Pydantic schemas: AssemblyCreate/Update/Out, AgendaCreate/Out, AttendanceCreate/Out, VoteCreate/Out, VoteSummary, MinuteCreate/Update/Out
- `schemas/task.py` — Pydantic schemas: TaskCreate/Update/Out
- `services/assembly_service.py` — create_assembly, announce, attendance tracking, quorum calculation, vote submission/summary, create minute
- `services/task_service.py` — create_task, update_task, list_tasks
- `routers/assemblies.py` — CRUD asambleas + agendas + attendance + quorum + votes + minutes
- `routers/tasks.py` — CRUD tareas + complete endpoint

### Deliverables frontend
- `types/index.ts` — Assembly, Agenda, Attendance, Vote, VoteSummary, Minute, TaskFollowup interfaces
- `pages/assemblies/AssemblyList.tsx` — Listado de asambleas con filtros + crear + anunciar
- `pages/assemblies/AssemblyDetail.tsx` — Detalle de asamblea con enlaces a agenda/actas
- `pages/assemblies/AgendaBuilder.tsx` — Builder de agenda con temas
- `pages/assemblies/AttendanceTracker.tsx` — Tracker de asistencia/quorum visual
- `pages/assemblies/VoteForm.tsx` — Formulario de votacion digital (favor/en_contra/abstencion)
- `pages/assemblies/MinutesView.tsx` — Visualizacion de actas con versioning
- `pages/assemblies/TaskList.tsx` — Listado de tareas asignadas
- `pages/assemblies/TaskDetail.tsx` — Detalle de tarea

### Decisiones clave
- Quorum: calculado dinamicamente desde attendance (confirmed/total_residents)
- Votacion: opciones fijas (favor/en_contra/abstencion), solo residentes con asistencia confirmada
- Actas: versioning automatico al actualizar
- RBAC: consejo(3)+ crea/gestiona asambleas y tareas; admin(4)+ todo

## Resumen Fase 15 — Modulo D

### Deliverables backend
- `init_schema.sql` — Tablas: `providers`, `provider_contracts`, `maintenance_alerts` + enums (provider_type, contract_status, alert_type, alert_status)
- `models/provider.py` — SQLAlchemy models: Provider, ProviderContract, MaintenanceAlert
- `schemas/provider.py` — Pydantic schemas: ProviderCreate/Update/Out, ContractCreate/Update/Out, AlertCreate/Update/Out, AlertSummary, AlertDashboardSummary, PaginatedAlertsResponse
- `services/provider_service.py` — CRUD providers + contracts (create, list, get, update, deactivate)
- `services/alert_service.py` — CRUD alerts + dashboard summary + contract expiry alert generation
- `routers/providers.py` — CRUD providers + contracts endpoints
- `routers/maintenance.py` — CRUD alerts + dashboard + notify/complete/dismiss endpoints

### Deliverables frontend
- `types/index.ts` — Provider, Contract, MaintenanceAlert, AlertSummary interfaces
- `lib/constants.ts` — PROVIDER_TYPE_LABELS, CONTRACT_STATUS_LABELS, ALERT_TYPE_LABELS, ALERT_STATUS_LABELS
- `pages/providers/ProviderList.tsx` — Listado de proveedores
- `pages/providers/ProviderForm.tsx` — Formulario de crear/editar proveedor
- `pages/providers/ContractView.tsx` — Listado de contratos por proveedor
- `pages/maintenance/AlertDashboard.tsx` — Dashboard con resumen cards + alertas pendientes/vencidas + acciones
- `pages/maintenance/AlertForm.tsx` — Formulario de nueva alerta
- `pages/maintenance/MaintenanceCalendar.tsx` — Calendario visual de alertas agrupado por mes

### Decisiones clave
- Provider specialty: free text, no enum para flexibilidad
- renewal_notice_days: configurable por contrato (default 30) para alertas anticipadas
- Alert type enum: maintenance/contract_expiry/warranty_expiry
- Contracts no tienen asset_id directo (se vinculan solo al provider)
- RBAC: consejo(3)+ CRUD providers/alerts; admin(4)+ generate contract alerts

## Resumen Fase 16 — UI/UX Refinement

### Deliverables design system
- `frontend/src/styles/theme.css` — 400+ line design system con CSS variables (colors, typography, spacing, borders, shadows, animations)
- Utility classes: btn, input, select, textarea, card, badge, data-table, pagination, modal, toast, empty-state

### Component library
- `Button.tsx` — 4 variants (primary/secondary/ghost/danger), 3 sizes (sm/base/lg), href support
- `Input.tsx` — Multiple input types, error class
- `Select.tsx` — Dropdown con options array
- `Textarea.tsx` — Resizable textarea con error support
- `Modal.tsx` — Overlay modal con header/body/footer
- `Toast.tsx` — Sistema de notificaciones

### Component improvements
- `Sidebar.tsx` — Nav groups (Principal, Gestion, Administracion, Convivencia), role-based filtering (minRole), collapsible, profile section
- `Header.tsx` — Refactored a usar Button component
- `DataTable.tsx` — Client-side sorting, pagination UI, empty states, hover rows, sortable indicators

### Pages refactored (inline styles → components/CSS classes)
- Auth: Login, Register
- Users: UserList, UserForm, Profile
- Visitors: VisitorList, VisitorForm
- Authorizations: AuthorizationList, AuthorizationForm
- Census: ResidentList, ResidentForm
- Assets: AssetList, AssetForm
- Documents: DocumentDashboard, DocumentUpload, DocumentSearch, ShareLinkView
- Audit: AuditLog
- Settings: Settings
- Dashboard: Dashboard
- Finance: InvoiceDashboard, BalanceView, PazYSalvo, ImportData, PaymentHistory
- Communication: PQRSForm, PQRSList, FAQAdmin, FAQView, CircularDashboard, CommunicationHistory
- Reservations: CalendarView, ReservationForm, ReservationList
- Convivencia: InfractionList, InfractionForm, RegulationView
- Assemblies: AssemblyList, AssemblyDetail, AgendaBuilder, AttendanceTracker, VoteForm, MinutesView, TaskList, TaskDetail

### Decisiones clave
- CSS variables como unico sistema de estilizado (no inline styles, no CSS-in-JS)
- Component props preferred over inline styles
- Consistent 4px spacing scale throughout
- Mobile-first responsive design
