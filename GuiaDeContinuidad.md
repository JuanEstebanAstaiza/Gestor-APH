# GuiaDeContinuidad — Gestor APH

## Estado de Fases

| Fase | Nombre | Estado | Doc |
|------|--------|--------|-----|
| 10 | Services + Tasks | COMPLETADA | [PHASE_10_SERVICES_AND_TASKS.md](Documentacion/fases/PHASE_10_SERVICES_AND_TASKS.md) |
| 11 | Modulo A — Gestion Financiera | COMPLETADA | [PHASE_11_MODULO_A_FINANCIERO.md](Documentacion/fases/PHASE_11_MODULO_A_FINANCIERO.md) |
| 12 | Modulo C — Atencion y Comunicacion | COMPLETADA | [PHASE_12_MODULO_C_ATENCION.md](Documentacion/fases/PHASE_12_MODULO_C_ATENCION.md) |
| 13 | Modulo G — Reservas y Convivencia | COMPLETADA | [PHASE_13_MODULO_G_RESERVAS.md](Documentacion/fases/PHASE_13_MODULO_G_RESERVAS.md) |
| 14 | Modulo F — Asambleas y Consejo | PENDIENTE | [PHASE_14_MODULO_F_ASAMBLEAS.md](Documentacion/fases/PHASE_14_MODULO_F_ASAMBLEAS.md) |
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
