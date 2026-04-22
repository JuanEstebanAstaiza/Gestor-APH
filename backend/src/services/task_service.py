from datetime import date, datetime, timezone


def create_task(title: str, description: str, assigned_to: int,
                assembly_id: int | None = None, deadline: str | None = None) -> dict:
    """Create a task followup."""
    from src.main import SessionLocal
    from src.models.assembly import TaskFollowup

    db = SessionLocal()
    try:
        task = TaskFollowup(
            assembly_id=assembly_id,
            title=title,
            description=description,
            assigned_to=assigned_to,
            deadline=deadline,
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        return {
            "id": task.id,
            "uuid": str(task.uuid),
            "status": task.status,
        }
    finally:
        db.close()


def update_task(task_id: int, status: str, notes: str | None = None,
                completed_at: str | None = None) -> dict:
    """Update a task status."""
    from src.main import SessionLocal
    from src.models.assembly import TaskFollowup

    db = SessionLocal()
    try:
        task = db.query(TaskFollowup).filter(
            TaskFollowup.id == task_id, TaskFollowup.is_active == True
        ).first()
        if not task:
            raise ValueError("Tarea no encontrada")

        task.status = status
        if status == "completed":
            task.completed_at = datetime.now(timezone.utc).isoformat()
        if notes:
            task.notes = notes
        db.commit()
        db.refresh(task)

        return {"id": task.id, "uuid": str(task.uuid), "status": task.status}
    finally:
        db.close()


def list_tasks(assigned_to: int | None = None, status_filter: str | None = None,
               assembly_id: int | None = None) -> list[dict]:
    """List task followups with optional filters."""
    from src.main import SessionLocal
    from src.models.assembly import TaskFollowup

    db = SessionLocal()
    try:
        query = db.query(TaskFollowup).filter(TaskFollowup.is_active == True)
        if assigned_to:
            query = query.filter(TaskFollowup.assigned_to == assigned_to)
        if status_filter:
            query = query.filter(TaskFollowup.status == status_filter)
        if assembly_id:
            query = query.filter(TaskFollowup.assembly_id == assembly_id)

        tasks = query.order_by(TaskFollowup.deadline.asc()).all()
        return [
            {
                "id": t.id,
                "uuid": str(t.uuid),
                "assembly_id": t.assembly_id,
                "title": t.title,
                "description": t.description,
                "assigned_to": t.assigned_to,
                "deadline": t.deadline,
                "status": t.status,
                "completed_at": t.completed_at,
                "notes": t.notes,
                "created_at": t.created_at,
            }
            for t in tasks
        ]
    finally:
        db.close()
