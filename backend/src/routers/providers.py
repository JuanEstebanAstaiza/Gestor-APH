from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.provider import (
    ProviderCreate, ProviderUpdate, ProviderOut,
    ContractCreate, ContractUpdate, ContractOut,
)
from src.services import provider_service

router = APIRouter()


# === Providers ===

@router.get("/providers", response_model=list[ProviderOut])
def list_providers(
    is_active: bool | None = None,
    specialty: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    providers = provider_service.list_providers(is_active, specialty)
    return providers


@router.post("/providers", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
def create_provider(body: ProviderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = provider_service.create_provider(
        name=body.name,
        provider_type=body.type,
        specialty=body.specialty,
        contact_name=body.contact_name,
        phone=body.phone,
        email=body.email,
        address=body.address,
        notes=body.notes,
        created_by=user.id,
    )
    return result


@router.get("/providers/{provider_id}", response_model=ProviderOut)
def get_provider(provider_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = provider_service.get_provider(provider_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    return result


@router.put("/providers/{provider_id}", response_model=ProviderOut)
def update_provider(provider_id: int, body: ProviderUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    result = provider_service.update_provider(provider_id, updates)
    return result


@router.post("/providers/{provider_id}/deactivate")
def deactivate_provider(provider_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = provider_service.deactivate_provider(provider_id)
    return result


# === Contracts ===

@router.get("/providers/{provider_id}/contracts", response_model=list[ContractOut])
def list_contracts(
    provider_id: int,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    contracts = provider_service.list_contracts(provider_id, status_filter)
    return contracts


@router.post("/providers/{provider_id}/contracts", response_model=ContractOut, status_code=status.HTTP_201_CREATED)
def create_contract(
    provider_id: int,
    body: ContractCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_role(user, "consejo")
    result = provider_service.create_contract(
        provider_id=provider_id,
        contract_name=body.contract_name,
        start_date=body.start_date,
        description=body.description,
        end_date=body.end_date,
        value=body.value,
        status=body.status or "active",
        renewal_notice_days=body.renewal_notice_days,
        created_by=user.id,
    )
    return result


@router.get("/contracts/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.provider import ProviderContract

    contract = db.query(ProviderContract).filter(
        ProviderContract.id == contract_id, ProviderContract.is_active == True
    ).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato no encontrado")
    return contract


@router.put("/contracts/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, body: ContractUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.provider import ProviderContract

    contract = db.query(ProviderContract).filter(
        ProviderContract.id == contract_id, ProviderContract.is_active == True
    ).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato no encontrado")
    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(contract, key, value)
    db.commit()
    db.refresh(contract)
    return contract
