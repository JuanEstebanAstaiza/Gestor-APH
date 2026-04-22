from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.communication import PQRSCreate, PQRSUpdate, PQRSOut
from src.services import communication_service

router = APIRouter()


@router.get("/pqrs", response_model=list[PQRSOut])
def list_pqrs(
    status_filter: str | None = None,
    category: str | None = None,
    requester_id: int | None = None,
    db: Session = Depends(get_db),
):
    from src.models.communication import PQRS
    q = db.query(PQRS).filter(PQRS.is_active == True)
    if status_filter:
        q = q.filter(PQRS.status == status_filter)
    if category:
        q = q.filter(PQRS.category == category)
    if requester_id:
        q = q.filter(PQRS.requester_id == requester_id)
    return q.order_by(PQRS.created_at.desc()).all()


@router.get("/pqrs/{pqrs_id}", response_model=PQRSOut)
def get_pqrs(pqrs_id: int, db: Session = Depends(get_db)):
    from src.models.communication import PQRS
    pqrs = db.query(PQRS).filter(PQRS.id == pqrs_id).first()
    if not pqrs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrado")
    return pqrs


@router.post("/pqrs", response_model=PQRSOut, status_code=status.HTTP_201_CREATED)
def create_pqrs(body: PQRSCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = communication_service.create_pqrs(
        requester_id=body.requester_id,
        ptype=body.type,
        subject=body.subject,
        description=body.description,
        category=body.category,
        priority=body.priority,
    )
    # Return full object
    from src.models.communication import PQRS
    pqrs = db.query(PQRS).filter(PQRS.id == result["id"]).first()
    return pqrs


@router.put("/pqrs/{pqrs_id}", response_model=PQRSOut)
def update_pqrs(pqrs_id: int, body: PQRSUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = communication_service.update_pqrs_status(pqrs_id, body.status or "open", body.response)
    from src.models.communication import PQRS
    pqrs = db.query(PQRS).filter(PQRS.id == pqrs_id).first()
    return pqrs


@router.post("/pqrs/{pqrs_id}/assign")
def assign_pqrs(pqrs_id: int, assigned_to: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.communication import PQRS
    pqrs = db.query(PQRS).filter(PQRS.id == pqrs_id).first()
    if not pqrs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrado")
    pqrs.assigned_to = assigned_to
    pqrs.status = "in_progress"
    db.commit()
    return {"assigned_to": assigned_to, "status": "in_progress"}
