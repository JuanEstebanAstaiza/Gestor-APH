from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.permissions import require_any_role
from src.dependencies import get_current_user, get_db
from src.models.user import User
from src.models.asset import Asset
from src.models.resident_asset import ResidentAsset
from src.schemas.asset import AssetCreate, AssetOut, AssetUpdate

router = APIRouter()


@router.get("")
def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type_filter: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])

    query = db.query(Asset).filter(Asset.is_active == True)
    if type_filter:
        query = query.filter(Asset.asset_type == type_filter)

    total = query.count()
    data = (
        query.order_by(Asset.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [AssetOut.model_validate(a) for a in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_active == True).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")
    return AssetOut.model_validate(asset)


@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
def create_asset(
    body: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    asset = Asset(**body.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return AssetOut.model_validate(asset)


@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: int,
    body: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return AssetOut.model_validate(asset)


@router.post("/{asset_id}/link")
def link_asset(
    asset_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    resident_id = body.get("resident_id")
    if not resident_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="resident_id requerido")

    existing = db.query(ResidentAsset).filter(
        ResidentAsset.resident_id == resident_id, ResidentAsset.asset_id == asset_id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya vinculado")

    link = ResidentAsset(resident_id=resident_id, asset_id=asset_id, is_primary=body.get("is_primary", False))
    db.add(link)
    db.commit()
    return {"message": "Activo vinculado"}


@router.delete("/{asset_id}/link/{link_id}")
def unlink_asset(
    asset_id: int,
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_any_role(current_user, ["admin", "consejo"])
    link = db.query(ResidentAsset).filter(ResidentAsset.id == link_id).first()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vinculación no encontrada")
    db.delete(link)
    db.commit()
    return {"message": "Vinculación eliminada"}
