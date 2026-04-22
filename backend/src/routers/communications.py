from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.models.user import User
from src.schemas.communication import CommunicationOut
from src.services import communication_service

router = APIRouter()


@router.get("/communications", response_model=list[CommunicationOut])
def list_communications(
    recipient_id: int | None = None,
    comm_type: str | None = None,
    db: Session = Depends(get_db),
):
    from src.models.communication import Communication
    q = db.query(Communication).filter(Communication.is_active == True)
    if recipient_id:
        q = q.filter(Communication.recipient_id == recipient_id)
    if comm_type:
        q = q.filter(Communication.type == comm_type)
    return q.order_by(Communication.created_at.desc()).all()


@router.post("/communications")
def send_communication(
    sender_id: int,
    recipient_id: int,
    comm_type: str,
    subject: str | None = None,
    content: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return communication_service.send_communication(sender_id, recipient_id, comm_type, subject, content)
