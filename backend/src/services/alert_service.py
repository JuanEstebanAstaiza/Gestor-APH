from datetime import datetime, timedelta, timezone

from src.services import finance_service


def create_alert(asset_id: int, alert_type: str, description: str, scheduled_date: str,
                 provider_id: int | None = None, notes: str | None = None) -> dict:
    """Create a maintenance alert."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = MaintenanceAlert(
            asset_id=asset_id,
            alert_type=alert_type,
            description=description,
            scheduled_date=scheduled_date,
            provider_id=provider_id,
            notes=notes,
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "asset_id": alert.asset_id,
            "provider_id": alert.provider_id,
            "alert_type": alert.alert_type,
            "description": alert.description,
            "scheduled_date": alert.scheduled_date,
            "status": alert.status,
            "notified_at": alert.notified_at,
            "completed_at": alert.completed_at,
            "notified_to": alert.notified_to,
            "notes": alert.notes,
            "is_active": alert.is_active,
        }
    finally:
        db.close()


def list_alerts(status_filter: str | None = None, alert_type_filter: str | None = None,
                asset_id: int | None = None, scheduled_before: str | None = None) -> list[dict]:
    """List alerts with optional filters."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        query = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.is_active == True,
        )
        if status_filter:
            query = query.filter(MaintenanceAlert.status == status_filter)
        if alert_type_filter:
            query = query.filter(MaintenanceAlert.alert_type == alert_type_filter)
        if asset_id:
            query = query.filter(MaintenanceAlert.asset_id == asset_id)
        if scheduled_before:
            query = query.filter(MaintenanceAlert.scheduled_date <= scheduled_before)
        alerts = query.order_by(MaintenanceAlert.scheduled_date.asc()).all()
        return [
            {
                "id": a.id,
                "uuid": str(a.uuid),
                "asset_id": a.asset_id,
                "provider_id": a.provider_id,
                "alert_type": a.alert_type,
                "description": a.description,
                "scheduled_date": a.scheduled_date,
                "status": a.status,
                "notified_at": a.notified_at,
                "completed_at": a.completed_at,
                "notified_to": a.notified_to,
                "notes": a.notes,
                "is_active": a.is_active,
            }
            for a in alerts
        ]
    finally:
        db.close()


def get_alert(alert_id: int) -> dict | None:
    """Get a single alert by ID."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.id == alert_id, MaintenanceAlert.is_active == True
        ).first()
        if not alert:
            return None
        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "asset_id": alert.asset_id,
            "provider_id": alert.provider_id,
            "alert_type": alert.alert_type,
            "description": alert.description,
            "scheduled_date": alert.scheduled_date,
            "status": alert.status,
            "notified_at": alert.notified_at,
            "completed_at": alert.completed_at,
            "notified_to": alert.notified_to,
            "notes": alert.notes,
            "is_active": alert.is_active,
        }
    finally:
        db.close()


def update_alert(alert_id: int, updates: dict) -> dict:
    """Update an alert."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.id == alert_id, MaintenanceAlert.is_active == True
        ).first()
        if not alert:
            raise ValueError("Alerta no encontrada")

        for key, value in updates.items():
            setattr(alert, key, value)
        db.commit()
        db.refresh(alert)

        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "asset_id": alert.asset_id,
            "provider_id": alert.provider_id,
            "alert_type": alert.alert_type,
            "description": alert.description,
            "scheduled_date": alert.scheduled_date,
            "status": alert.status,
            "notified_at": alert.notified_at,
            "completed_at": alert.completed_at,
            "notified_to": alert.notified_to,
            "notes": alert.notes,
            "is_active": alert.is_active,
        }
    finally:
        db.close()


def notify_alert(alert_id: int, notified_to: int) -> dict:
    """Mark an alert as notified."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.id == alert_id, MaintenanceAlert.is_active == True
        ).first()
        if not alert:
            raise ValueError("Alerta no encontrada")

        alert.status = "notified"
        alert.notified_at = datetime.now(timezone.utc).isoformat()
        alert.notified_to = notified_to
        db.commit()
        db.refresh(alert)

        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "status": alert.status,
            "notified_at": alert.notified_at,
            "notified_to": alert.notified_to,
        }
    finally:
        db.close()


def complete_alert(alert_id: int) -> dict:
    """Mark an alert as completed."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.id == alert_id, MaintenanceAlert.is_active == True
        ).first()
        if not alert:
            raise ValueError("Alerta no encontrada")

        alert.status = "completed"
        alert.completed_at = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(alert)

        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "status": alert.status,
            "completed_at": alert.completed_at,
        }
    finally:
        db.close()


def dismiss_alert(alert_id: int) -> dict:
    """Dismiss an alert."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert

    db = SessionLocal()
    try:
        alert = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.id == alert_id, MaintenanceAlert.is_active == True
        ).first()
        if not alert:
            raise ValueError("Alerta no encontrada")

        alert.status = "dismissed"
        db.commit()
        db.refresh(alert)

        return {
            "id": alert.id,
            "uuid": str(alert.uuid),
            "status": alert.status,
        }
    finally:
        db.close()


def get_dashboard_summary() -> dict:
    """Get alert dashboard summary grouped by asset."""
    from src.main import SessionLocal
    from src.models.provider import MaintenanceAlert
    from src.models.asset import Asset

    db = SessionLocal()
    try:
        today = datetime.now(timezone.utc).date().isoformat()

        pending_alerts = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.is_active == True,
            MaintenanceAlert.status == "pending",
        ).all()

        overdue_alerts = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.is_active == True,
            MaintenanceAlert.status.in_(["pending", "notified"]),
            MaintenanceAlert.scheduled_date < today,
        ).all()

        upcoming_alerts = db.query(MaintenanceAlert).filter(
            MaintenanceAlert.is_active == True,
            MaintenanceAlert.status == "pending",
            MaintenanceAlert.scheduled_date >= today,
            MaintenanceAlert.scheduled_date <= (
                datetime.now(timezone.utc).date() + timedelta(days=30)
            ).isoformat(),
        ).all()

        # Group by asset
        asset_groups = {}
        for alert in pending_alerts:
            if alert.asset_id not in asset_groups:
                asset_groups[alert.asset_id] = {"pending": 0, "overdue": 0, "upcoming": 0}
            asset_groups[alert.asset_id]["pending"] += 1

        for alert in overdue_alerts:
            if alert.asset_id not in asset_groups:
                asset_groups[alert.asset_id] = {"pending": 0, "overdue": 0, "upcoming": 0}
            asset_groups[alert.asset_id]["overdue"] += 1

        for alert in upcoming_alerts:
            if alert.asset_id not in asset_groups:
                asset_groups[alert.asset_id] = {"pending": 0, "overdue": 0, "upcoming": 0}
            asset_groups[alert.asset_id]["upcoming"] += 1

        # Get asset details
        assets = db.query(Asset).filter(
            Asset.id.in_(asset_groups.keys()),
            Asset.is_active == True,
        ).all()
        asset_map = {a.id: a for a in assets}

        summaries = []
        for asset_id, counts in asset_groups.items():
            asset = asset_map.get(asset_id)
            if asset:
                summaries.append({
                    "asset_id": asset_id,
                    "asset_unit_number": asset.unit_number,
                    "asset_type": asset.asset_type,
                    "pending_count": counts["pending"],
                    "overdue_count": counts["overdue"],
                    "upcoming_count": counts["upcoming"],
                })

        return {
            "alerts": [
                {
                    "id": a.id,
                    "uuid": str(a.uuid),
                    "asset_id": a.asset_id,
                    "provider_id": a.provider_id,
                    "alert_type": a.alert_type,
                    "description": a.description,
                    "scheduled_date": a.scheduled_date,
                    "status": a.status,
                    "notified_at": a.notified_at,
                    "completed_at": a.completed_at,
                    "notified_to": a.notified_to,
                    "notes": a.notes,
                    "is_active": a.is_active,
                }
                for a in overdue_alerts + upcoming_alerts
            ],
            "summary": summaries,
            "total_pending": len(pending_alerts),
            "total_overdue": len(overdue_alerts),
            "total_completed": len(db.query(MaintenanceAlert).filter(
                MaintenanceAlert.is_active == True,
                MaintenanceAlert.status == "completed",
            ).all()),
        }
    finally:
        db.close()


def generate_contract_expiry_alerts() -> list[dict]:
    """Generate alerts for contracts expiring within their renewal notice period."""
    from src.main import SessionLocal
    from src.models.provider import ProviderContract, MaintenanceAlert, Provider
    from datetime import date

    db = SessionLocal()
    try:
        today = date.today()
        contracts = db.query(ProviderContract).filter(
            ProviderContract.is_active == True,
            ProviderContract.status == "active",
            ProviderContract.end_date != None,
        ).all()

        new_alerts = []
        for contract in contracts:
            if contract.end_date:
                expiry_date = contract.end_date
                notice_date = expiry_date - timedelta(days=contract.renewal_notice_days)
                if notice_date <= today <= expiry_date:
                    # Check if alert already exists
                    existing = db.query(MaintenanceAlert).filter(
                        MaintenanceAlert.is_active == True,
                        MaintenanceAlert.alert_type == "contract_expiry",
                        MaintenanceAlert.scheduled_date == expiry_date.isoformat(),
                    ).first()
                    if not existing:
                        provider = db.query(Provider).filter(
                            Provider.id == contract.provider_id
                        ).first()
                        alert = MaintenanceAlert(
                            asset_id=0,  # No direct asset link for contracts
                            provider_id=contract.provider_id,
                            alert_type="contract_expiry",
                            description=f"Contrato '{contract.contract_name}' expira el {expiry_date}",
                            scheduled_date=expiry_date.isoformat(),
                            notes=f"Proveedor: {provider.name if provider else 'N/A'}",
                        )
                        db.add(alert)
                        new_alerts.append(alert)

        if new_alerts:
            db.commit()

        return [
            {
                "id": a.id,
                "uuid": str(a.uuid),
                "alert_type": a.alert_type,
                "description": a.description,
                "scheduled_date": a.scheduled_date,
            }
            for a in new_alerts
        ]
    finally:
        db.close()
