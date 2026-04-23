from datetime import datetime, timezone

from src.services import finance_service


def create_provider(name: str, provider_type: str, specialty: str | None = None,
                    contact_name: str | None = None, phone: str | None = None,
                    email: str | None = None, address: str | None = None,
                    notes: str | None = None, created_by: int | None = None) -> dict:
    """Create a new provider."""
    from src.main import SessionLocal
    from src.models.provider import Provider

    db = SessionLocal()
    try:
        provider = Provider(
            name=name,
            type=provider_type,
            specialty=specialty,
            contact_name=contact_name,
            phone=phone,
            email=email,
            address=address,
            notes=notes,
            created_by=created_by,
        )
        db.add(provider)
        db.commit()
        db.refresh(provider)

        return {
            "id": provider.id,
            "uuid": str(provider.uuid),
            "name": provider.name,
            "type": provider.type,
            "specialty": provider.specialty,
            "contact_name": provider.contact_name,
            "phone": provider.phone,
            "email": provider.email,
            "address": provider.address,
            "notes": provider.notes,
            "is_active": provider.is_active,
            "created_by": provider.created_by,
        }
    finally:
        db.close()


def list_providers(is_active: bool | None = None, specialty: str | None = None) -> list[dict]:
    """List providers with optional filters."""
    from src.main import SessionLocal
    from src.models.provider import Provider

    db = SessionLocal()
    try:
        query = db.query(Provider).filter(Provider.is_active == True)
        if is_active is not None:
            query = query.filter(Provider.is_active == is_active)
        if specialty:
            query = query.filter(Provider.specialty == specialty)
        providers = query.order_by(Provider.created_at.desc()).all()
        return [
            {
                "id": p.id,
                "uuid": str(p.uuid),
                "name": p.name,
                "type": p.type,
                "specialty": p.specialty,
                "contact_name": p.contact_name,
                "phone": p.phone,
                "email": p.email,
                "address": p.address,
                "notes": p.notes,
                "is_active": p.is_active,
                "created_by": p.created_by,
            }
            for p in providers
        ]
    finally:
        db.close()


def get_provider(provider_id: int) -> dict | None:
    """Get a single provider by ID."""
    from src.main import SessionLocal
    from src.models.provider import Provider

    db = SessionLocal()
    try:
        provider = db.query(Provider).filter(
            Provider.id == provider_id, Provider.is_active == True
        ).first()
        if not provider:
            return None
        return {
            "id": provider.id,
            "uuid": str(provider.uuid),
            "name": provider.name,
            "type": provider.type,
            "specialty": provider.specialty,
            "contact_name": provider.contact_name,
            "phone": provider.phone,
            "email": provider.email,
            "address": provider.address,
            "notes": provider.notes,
            "is_active": provider.is_active,
            "created_by": provider.created_by,
        }
    finally:
        db.close()


def update_provider(provider_id: int, updates: dict) -> dict:
    """Update a provider."""
    from src.main import SessionLocal
    from src.models.provider import Provider

    db = SessionLocal()
    try:
        provider = db.query(Provider).filter(
            Provider.id == provider_id, Provider.is_active == True
        ).first()
        if not provider:
            raise ValueError("Proveedor no encontrado")

        for key, value in updates.items():
            setattr(provider, key, value)
        db.commit()
        db.refresh(provider)

        return {
            "id": provider.id,
            "uuid": str(provider.uuid),
            "name": provider.name,
            "type": provider.type,
            "specialty": provider.specialty,
            "contact_name": provider.contact_name,
            "phone": provider.phone,
            "email": provider.email,
            "address": provider.address,
            "notes": provider.notes,
            "is_active": provider.is_active,
            "created_by": provider.created_by,
        }
    finally:
        db.close()


def deactivate_provider(provider_id: int) -> dict:
    """Soft delete a provider."""
    from src.main import SessionLocal
    from src.models.provider import Provider

    db = SessionLocal()
    try:
        provider = db.query(Provider).filter(
            Provider.id == provider_id, Provider.is_active == True
        ).first()
        if not provider:
            raise ValueError("Proveedor no encontrado")

        provider.is_active = False
        db.commit()
        db.refresh(provider)

        return {"id": provider.id, "uuid": str(provider.uuid), "is_active": False}
    finally:
        db.close()


def create_contract(provider_id: int, contract_name: str, start_date: str,
                    description: str | None = None, end_date: str | None = None,
                    value: str | None = None, status: str = "active",
                    renewal_notice_days: int | None = None,
                    created_by: int | None = None) -> dict:
    """Create a provider contract."""
    from src.main import SessionLocal
    from src.models.provider import ProviderContract

    db = SessionLocal()
    try:
        contract = ProviderContract(
            provider_id=provider_id,
            contract_name=contract_name,
            description=description,
            start_date=start_date,
            end_date=end_date,
            value=value,
            status=status,
            renewal_notice_days=renewal_notice_days or 30,
            created_by=created_by,
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)

        return {
            "id": contract.id,
            "provider_id": contract.provider_id,
            "contract_name": contract.contract_name,
            "description": contract.description,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "value": contract.value,
            "status": contract.status,
            "renewal_notice_days": contract.renewal_notice_days,
            "is_active": contract.is_active,
            "created_by": contract.created_by,
        }
    finally:
        db.close()


def list_contracts(provider_id: int | None = None, status_filter: str | None = None) -> list[dict]:
    """List contracts with optional filters."""
    from src.main import SessionLocal
    from src.models.provider import ProviderContract

    db = SessionLocal()
    try:
        query = db.query(ProviderContract).filter(ProviderContract.is_active == True)
        if provider_id:
            query = query.filter(ProviderContract.provider_id == provider_id)
        if status_filter:
            query = query.filter(ProviderContract.status == status_filter)
        contracts = query.order_by(ProviderContract.end_date.desc()).all()
        return [
            {
                "id": c.id,
                "provider_id": c.provider_id,
                "contract_name": c.contract_name,
                "description": c.description,
                "start_date": c.start_date,
                "end_date": c.end_date,
                "value": c.value,
                "status": c.status,
                "renewal_notice_days": c.renewal_notice_days,
                "is_active": c.is_active,
                "created_by": c.created_by,
            }
            for c in contracts
        ]
    finally:
        db.close()


def update_contract(contract_id: int, updates: dict) -> dict:
    """Update a contract."""
    from src.main import SessionLocal
    from src.models.provider import ProviderContract

    db = SessionLocal()
    try:
        contract = db.query(ProviderContract).filter(
            ProviderContract.id == contract_id, ProviderContract.is_active == True
        ).first()
        if not contract:
            raise ValueError("Contrato no encontrado")

        for key, value in updates.items():
            setattr(contract, key, value)
        db.commit()
        db.refresh(contract)

        return {
            "id": contract.id,
            "provider_id": contract.provider_id,
            "contract_name": contract.contract_name,
            "description": contract.description,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "value": contract.value,
            "status": contract.status,
            "renewal_notice_days": contract.renewal_notice_days,
            "is_active": contract.is_active,
            "created_by": contract.created_by,
        }
    finally:
        db.close()
