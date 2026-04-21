from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.permissions import require_any_role
from src.dependencies import get_current_user, get_db
from src.models.user import User
from src.models.authorization import Authorization
from src.schemas.authorization import AuthorizationCreate, AuthorizationOut

router = APIRouter()


@router.get("")
def list_authorizations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo", "vigilancia"])

    query = db.query(Authorization).filter(Authorization.is_active == True)
    if status_filter:
        query = query.filter(Authorization.status == status_filter)

    total = query.count()
    data = (
        query.order_by(Authorization.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [AuthorizationOut.model_validate(a) for a in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.post("", response_model=AuthorizationOut, status_code=status.HTTP_201_CREATED)
def create_authorization(
    body: AuthorizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    census = current_user.census
    if not census or not census.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene censo activo")

    auth = Authorization(
        requester_id=census.id,
        **body.model_dump(),
    )
    db.add(auth)
    db.commit()
    db.refresh(auth)
    return AuthorizationOut.model_validate(auth)


@router.patch("/{auth_id}/approve", response_model=AuthorizationOut)
def approve_authorization(
    auth_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    auth = db.query(Authorization).filter(Authorization.id == auth_id).first()
    if not auth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autorización no encontrada")
    if auth.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se pueden aprobar pendientes")

    auth.status = "approved"
    auth.approved_by = current_user.id
    db.commit()
    db.refresh(auth)
    return AuthorizationOut.model_validate(auth)


@router.patch("/{auth_id}/reject", response_model=AuthorizationOut)
def reject_authorization(
    auth_id: int,
    body: dict = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    auth = db.query(Authorization).filter(Authorization.id == auth_id).first()
    if not auth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autorización no encontrada")
    if auth.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se pueden rechazar pendientes")

    auth.status = "rejected"
    auth.approved_by = current_user.id
    if notes := body.get("notes"):
        auth.notes = notes
    db.commit()
    db.refresh(auth)
    return AuthorizationOut.model_validate(auth)
