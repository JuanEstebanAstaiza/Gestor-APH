# GuiaDeContinuidad — Gestor APH

## Estado de Fases

| Fase | Nombre | Estado | Doc |
|------|--------|--------|-----|
| 10 | Services + Tasks | COMPLETADA | [PHASE_10_SERVICES_AND_TASKS.md](Documentacion/fases/PHASE_10_SERVICES_AND_TASKS.md) |
| 11 | Modulo A — Gestion Financiera | COMPLETADA | [PHASE_11_MODULO_A_FINANCIERO.md](Documentacion/fases/PHASE_11_MODULO_A_FINANCIERO.md) |
| 12 | Modulo C — Atencion y Comunicacion | COMPLETADA | [PHASE_12_MODULO_C_ATENCION.md](Documentacion/fases/PHASE_12_MODULO_C_ATENCION.md) |
| 13 | Modulo G — Reservas y Convivencia | COMPLETADA | [PHASE_13_MODULO_G_RESERVAS.md](Documentacion/fases/PHASE_13_MODULO_G_RESERVAS.md) |
| 14 | Modulo F — Asambleas y Consejo | COMPLETADA | [PHASE_14_MODULO_F_ASAMBLEAS.md](Documentacion/fases/PHASE_14_MODULO_F_ASAMBLEAS.md) |
| 15 | Modulo D — Directorio de Proveedores | PENDIENTE | [PHASE_15_MODULO_D_PROVEEDORES.md](Documentacion/fases/PHASE_15_MODULO_D_PROVEEDORES.md) |
| 16 | UI/UX refinement | PENDIENTE | [PHASE_16_UI_UX.md](Documentacion/fases/PHASE_16_UI_UX.md) |
| 17 | Testing | PENDIENTE | [PHASE_17_TESTING.md](Documentacion/fases/PHASE_17_TESTING.md) |
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
