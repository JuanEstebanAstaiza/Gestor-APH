from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.communication import CircularCreate, CircularUpdate, CircularOut
from src.services import communication_service

router = APIRouter()


@router.get("/circulars", response_model=list[CircularOut])
def list_circulars(status_filter: str | None = None, db: Session = Depends(get_db)):
    from src.models.communication import Circular
    q = db.query(Circular).filter(Circular.is_active == True)
    if status_filter:
        q = q.filter(Circular.status == status_filter)
    return q.order_by(Circular.created_at.desc()).all()


@router.get("/circulars/{circular_id}", response_model=CircularOut)
def get_circular(circular_id: int, db: Session = Depends(get_db)):
    from src.models.communication import Circular
    circular = db.query(Circular).filter(Circular.id == circular_id).first()
    if not circular:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circular no encontrada")
    return circular


@router.post("/circulars", response_model=CircularOut, status_code=status.HTTP_201_CREATED)
def create_circular(body: CircularCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = communication_service.create_circular(
        title=body.title,
        content=body.content,
        target_type=body.target_type,
        target_value=body.target_value,
        sent_by=user.id,
    )
    from src.models.communication import Circular
    circular = db.query(Circular).filter(Circular.id == result["id"]).first()
    return circular


@router.put("/circulars/{circular_id}", response_model=CircularOut)
def update_circular(circular_id: int, body: CircularUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    circular = db.query(Circular).filter(Circular.id == circular_id).first()
    if not circular:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circular no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(circular, key, value)
    db.commit()
    db.refresh(circular)
    return circular


@router.post("/circulars/{circular_id}/send")
def send_circular(circular_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    return communication_service.send_circular(circular_id)


@router.delete("/circulars/{circular_id}")
def delete_circular(circular_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.communication import Circular
    circular = db.query(Circular).filter(Circular.id == circular_id).first()
    if not circular:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circular no encontrada")
    circular.is_active = False
    db.commit()
    return {"message": "Circular desactivada"}
