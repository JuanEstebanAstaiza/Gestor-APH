from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.provider import (
    AlertCreate, AlertUpdate, AlertOut,
    AlertDashboardSummary,
)
from src.services import alert_service

router = APIRouter()


# === Maintenance Alerts ===

@router.get("/maintenance/alerts", response_model=list[AlertOut])
def list_alerts(
    status_filter: str | None = None,
    alert_type_filter: str | None = None,
    asset_id: int | None = None,
    scheduled_before: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alerts = alert_service.list_alerts(status_filter, alert_type_filter, asset_id, scheduled_before)
    return alerts


@router.post("/maintenance/alerts", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def create_alert(body: AlertCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = alert_service.create_alert(
        asset_id=body.asset_id,
        alert_type=body.alert_type,
        description=body.description,
        scheduled_date=body.scheduled_date,
        provider_id=body.provider_id,
        notes=body.notes,
    )
    return result


@router.get("/maintenance/alerts/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = alert_service.get_alert(alert_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada")
    return result


@router.put("/maintenance/alerts/{alert_id}", response_model=AlertOut)
def update_alert(alert_id: int, body: AlertUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    result = alert_service.update_alert(alert_id, updates)
    return result


@router.post("/maintenance/alerts/{alert_id}/notify")
def notify_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = alert_service.notify_alert(alert_id, user.id)
    return result


@router.post("/maintenance/alerts/{alert_id}/complete")
def complete_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = alert_service.complete_alert(alert_id)
    return result


@router.post("/maintenance/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = alert_service.dismiss_alert(alert_id)
    return result


@router.get("/maintenance/dashboard")
def get_dashboard(user: User = Depends(get_current_user)):
    summary = alert_service.get_dashboard_summary()
    return summary


@router.post("/maintenance/alerts/generate-contract-alerts")
def generate_contract_alerts(user: User = Depends(get_current_user)):
    require_role(user, "admin")
    alerts = alert_service.generate_contract_expiry_alerts()
    return {"generated": len(alerts), "alerts": alerts}
