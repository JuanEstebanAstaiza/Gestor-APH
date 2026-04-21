# Phase 10 — Services y Tasks

## Estado: PENDIENTE

## Objetivo
Crear la capa de servicios del backend y el sistema de tareas automatizadas.

## Contexto
El backend tiene models, schemas, routers y core implementados, pero **no tiene servicios**.
Los routers están vacíos de lógica de negocio — necesitan los services para funcionar.

## Deliverables

### 1. `backend/src/services/auth_service.py`
- `forgot_password(email: str)` — genera token de recuperación, envía email
- `reset_password(token: str, new_password: str)` — valida token, actualiza password
- `generate_admin_seed()` — crea usuario admin inicial si no existe
- `validate_token_rotation()` — verifica que refresh tokens estén siendo rotados correctamente

### 2. `backend/src/services/file_service.py`
- `upload_file(file, resident_id)` — upload a S3/R2 (MVP: filesystem local en `uploads/`)
- `get_signed_url(path, expiry)` — signed URL para download
- `delete_file(path)` — removal de archivo
- `validate_file_type(file_type)` — whitelist de tipos permitidos

### 3. `backend/src/services/document_service.py`
- `auto_classify(title: str, description: str)` — clasifica documento por keywords/título
- `smart_search(query: str, user_id: int, filters: dict)` — búsqueda con filtros por categoría, fecha, tipo
- `generate_share_token(document_id: int)` — genera token de compartimiento con expiry
- `revoke_share_token(document_id: int)` — revoca token de compartimiento
- `create_document_version(document_id, file_path, user_id, note)` — versionado de documentos

### 4. `backend/src/services/census_service.py`
- `get_census_stats()` — resumen del censo (total residents, por tipo, por activo)
- `get_asset_occupants(asset_id: int)` — ocupantes de un activo
- `export_census(format: str)` — export CSV/JSON del censo
- `get_resident_full_profile(user_id: int)` — perfil completo con assets y files

### 5. `backend/src/tasks/auto_classify.py`
- Función para ejecución periódica de auto-classification
- Clasifica documentos sin categoría asignada
- Usa APScheduler o cron-like (MVP: simple loop con sleep)

## Decisiones técnicas
- **NO Alembic** — schema changes se hacen via `init_schema.sql` directo
- **MVP storage local** — archivos en `backend/src/uploads/`, migrar a S3/R2 después
- **Email opcional para MVP** — log messages en lugar de envío real
- **Tareas: simple loop** — no APScheduler en MVP, usar un background task con sleep

## Checklist
- [ ] Crear `services/auth_service.py`
- [ ] Crear `services/file_service.py`
- [ ] Crear `services/document_service.py`
- [ ] Crear `services/census_service.py`
- [ ] Crear `tasks/auto_classify.py`
- [ ] Actualizar `main.py` para incluir background task
- [ ] Actualizar `init_schema.sql` si hay nuevos campos necesarios
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 10

## Notas para próximos agentes
- Los services deben usar `SessionLocal` de `config.py` para DB access
- File service MVP usa filesystem local — no agregar boto3 dependency
- Email service MVP solo hace logging — integrar con SMTP en Fase 12
