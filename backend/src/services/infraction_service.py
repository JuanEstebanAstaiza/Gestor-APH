from datetime import datetime, timezone


def create_infraction(resident_id: int, asset_id: int, category: str, description: str,
                      severity: str, fine_amount: str | None = None,
                      issued_by: int = 0) -> dict:
    """Create an infraction record with severity-based warning escalation."""
    from src.main import SessionLocal
    from src.models.reservation import Infraction

    db = SessionLocal()
    try:
        # Check for recent open infractions of same category (reincidencia)
        existing = db.query(Infraction).filter(
            Infraction.resident_id == resident_id,
            Infraction.category == category,
            Infraction.status == "open",
        ).first()

        warning_count = 0
        if existing:
            warning_count = existing.warning_count + 1

        infraction = Infraction(
            resident_id=resident_id,
            asset_id=asset_id,
            category=category,
            description=description,
            severity=severity,
            warning_count=warning_count,
            fine_amount=fine_amount,
            issued_by=issued_by,
        )
        db.add(infraction)
        db.commit()
        db.refresh(infraction)

        return {
            "id": infraction.id,
            "uuid": str(infraction.uuid),
            "status": infraction.status,
            "warning_count": infraction.warning_count,
        }
    finally:
        db.close()


def acknowledge_infraction(infraction_id: int) -> dict:
    """Mark an infraction as acknowledged by the resident."""
    from src.main import SessionLocal
    from src.models.reservation import Infraction

    db = SessionLocal()
    try:
        infraction = db.query(Infraction).filter(
            Infraction.id == infraction_id,
            Infraction.is_active == True,
        ).first()
        if not infraction:
            raise ValueError("Infraccion no encontrada")

        infraction.status = "acknowledged"
        infraction.acknowledged_at = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(infraction)

        return {
            "id": infraction.id,
            "uuid": str(infraction.uuid),
            "status": infraction.status,
        }
    finally:
        db.close()


def resolve_infraction(infraction_id: int) -> dict:
    """Mark an infraction as resolved."""
    from src.main import SessionLocal
    from src.models.reservation import Infraction

    db = SessionLocal()
    try:
        infraction = db.query(Infraction).filter(
            Infraction.id == infraction_id,
            Infraction.is_active == True,
        ).first()
        if not infraction:
            raise ValueError("Infraccion no encontrada")

        infraction.status = "resolved"
        infraction.resolved_at = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(infraction)

        return {
            "id": infraction.id,
            "uuid": str(infraction.uuid),
            "status": infraction.status,
        }
    finally:
        db.close()


def list_infrictions(resident_id: int | None = None, asset_id: int | None = None,
                     status_filter: str | None = None) -> list[dict]:
    """List infractions with optional filters."""
    from src.main import SessionLocal
    from src.models.reservation import Infraction

    db = SessionLocal()
    try:
        query = db.query(Infraction).filter(Infraction.is_active == True)
        if resident_id:
            query = query.filter(Infraction.resident_id == resident_id)
        if asset_id:
            query = query.filter(Infraction.asset_id == asset_id)
        if status_filter:
            query = query.filter(Infraction.status == status_filter)

        infractions = query.order_by(Infraction.created_at.desc()).all()
        return [
            {
                "id": i.id,
                "uuid": str(i.uuid),
                "resident_id": i.resident_id,
                "asset_id": i.asset_id,
                "category": i.category,
                "description": i.description,
                "severity": i.severity,
                "warning_count": i.warning_count,
                "fine_amount": i.fine_amount,
                "status": i.status,
                "issued_by": i.issued_by,
                "created_at": i.created_at,
            }
            for i in infractions
        ]
    finally:
        db.close()


def list_regulations(chapter: str | None = None) -> list[dict]:
    """List regulations, optionally filtered by chapter."""
    from src.main import SessionLocal
    from src.models.reservation import Regulation

    db = SessionLocal()
    try:
        query = db.query(Regulation).filter(Regulation.is_active == True)
        if chapter:
            query = query.filter(Regulation.chapter == chapter)

        regulations = query.order_by(Regulation.chapter, Regulation.order).all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "content": r.content,
                "section_number": r.section_number,
                "chapter": r.chapter,
                "order": r.order,
            }
            for r in regulations
        ]
    finally:
        db.close()
