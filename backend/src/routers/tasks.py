from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.task import TaskCreate, TaskUpdate, TaskOut
from src.services import task_service

router = APIRouter()


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    assigned_to: int | None = None,
    status_filter: str | None = None,
    assembly_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tasks = task_service.list_tasks(assigned_to, status_filter, assembly_id)
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import TaskFollowup

    task = db.query(TaskFollowup).filter(
        TaskFollowup.id == task_id, TaskFollowup.is_active == True
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    return task


@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(body: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = task_service.create_task(
        title=body.title,
        description=body.description,
        assigned_to=body.assigned_to,
        assembly_id=body.assembly_id,
        deadline=body.deadline,
    )
    return result


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.assembly import TaskFollowup

    task = db.query(TaskFollowup).filter(TaskFollowup.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = task_service.update_task(task_id, status="completed")
    return result
