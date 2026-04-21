from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.permissions import require_any_role
from src.dependencies import get_current_user, get_db
from src.models.user import User
from src.models.visitor import Visitor
from src.schemas.visitor import VisitorCreate, VisitorOut, VisitorUpdate

router = APIRouter()


@router.get("")
def list_visitors(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo", "vigilancia"])

    query = db.query(Visitor).filter(Visitor.is_active == True)
    if status_filter:
        query = query.filter(Visitor.status == status_filter)

    total = query.count()
    data = (
        query.order_by(Visitor.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [VisitorOut.model_validate(v) for v in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.post("", response_model=VisitorOut, status_code=status.HTTP_201_CREATED)
def create_visitor(
    body: VisitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visitor = Visitor(**body.model_dump(), authorized_by=current_user.id)
    db.add(visitor)
    db.commit()
    db.refresh(visitor)
    return VisitorOut.model_validate(visitor)


@router.get("/{visitor_id}", response_model=VisitorOut)
def get_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id, Visitor.is_active == True).first()
    if not visitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitante no encontrado")
    return VisitorOut.model_validate(visitor)


@router.patch("/{visitor_id}", response_model=VisitorOut)
def update_visitor(
    visitor_id: int,
    body: VisitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo", "vigilancia"])
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitante no encontrado")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(visitor, key, value)

    db.commit()
    db.refresh(visitor)
    return VisitorOut.model_validate(visitor)
