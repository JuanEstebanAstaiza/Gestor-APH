from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.permissions import require_any_role
from src.dependencies import get_current_user, get_db
from src.models.user import User
from src.models.census import CensusResident
from src.schemas.census import CensusResidentCreate, CensusResidentOut, CensusResidentUpdate

router = APIRouter()


@router.get("/residents")
def list_residents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type_filter: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])

    query = db.query(CensusResident).filter(CensusResident.is_active == True)
    if type_filter:
        query = query.filter(CensusResident.property_type == type_filter)

    total = query.count()
    data = (
        query.order_by(CensusResident.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [CensusResidentOut.model_validate(r) for r in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.get("/residents/{resident_id}", response_model=CensusResidentOut)
def get_resident(
    resident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    resident = db.query(CensusResident).filter(CensusResident.id == resident_id, CensusResident.is_active == True).first()
    if not resident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Residente no encontrado")
    return CensusResidentOut.model_validate(resident)


@router.post("/residents", response_model=CensusResidentOut, status_code=status.HTTP_201_CREATED)
def create_resident(
    body: CensusResidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    resident = CensusResident(**body.model_dump())
    db.add(resident)
    db.commit()
    db.refresh(resident)
    return CensusResidentOut.model_validate(resident)


@router.patch("/residents/{resident_id}", response_model=CensusResidentOut)
def update_resident(
    resident_id: int,
    body: CensusResidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    resident = db.query(CensusResident).filter(CensusResident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Residente no encontrado")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(resident, key, value)

    db.commit()
    db.refresh(resident)
    return CensusResidentOut.model_validate(resident)
