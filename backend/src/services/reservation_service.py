from datetime import datetime, timezone

from src.services import finance_service


def create_reservation(resident_id: int, asset_id: int, area_type: str, area_name: str,
                       start_datetime: str, end_datetime: str, guests_count: int,
                       purpose: str | None = None, balance_check: bool = True) -> dict:
    """Create a reservation with optional balance check."""
    from src.main import SessionLocal
    from src.models.reservation import Reservation

    db = SessionLocal()
    try:
        # Check for conflicts
        conflicts = db.query(Reservation).filter(
            Reservation.asset_id == asset_id,
            Reservation.is_active == True,
            Reservation.status.in_(["approved", "pending"]),
            Reservation.start_datetime < end_datetime,
            Reservation.end_datetime > start_datetime,
        ).all()

        if conflicts:
            return {
                "error": "La area ya tiene una reserva en ese horario",
                "conflicts": [
                    {
                        "id": c.id,
                        "uuid": str(c.uuid),
                        "status": c.status,
                        "start": c.start_datetime,
                        "end": c.end_datetime,
                    }
                    for c in conflicts
                ],
            }

        # Balance check: block if resident has overdue debt
        if balance_check:
            balance = finance_service.get_balance(resident_id)
            if float(balance["balance"]) > 0 and balance["months_overdue"] > 0:
                return {
                    "error": "No se puede crear la reserva: la unidad tiene mora pendiente",
                    "balance": balance["balance"],
                    "months_overdue": balance["months_overdue"],
                }

        reservation = Reservation(
            resident_id=resident_id,
            asset_id=asset_id,
            area_type=area_type,
            area_name=area_name,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            guests_count=guests_count,
            purpose=purpose,
            balance_check=balance_check,
        )
        db.add(reservation)
        db.commit()
        db.refresh(reservation)

        return {
            "id": reservation.id,
            "uuid": str(reservation.uuid),
            "status": reservation.status,
            "start_datetime": reservation.start_datetime,
            "end_datetime": reservation.end_datetime,
        }
    finally:
        db.close()


def approve_reservation(reservation_id: int, approved_by: int) -> dict:
    """Approve a pending reservation."""
    from src.main import SessionLocal
    from src.models.reservation import Reservation

    db = SessionLocal()
    try:
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.is_active == True,
        ).first()
        if not reservation:
            raise ValueError("Reserva no encontrada")

        reservation.status = "approved"
        reservation.approved_by = approved_by
        reservation.approved_at = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(reservation)

        return {
            "id": reservation.id,
            "uuid": str(reservation.uuid),
            "status": reservation.status,
        }
    finally:
        db.close()


def reject_reservation(reservation_id: int, rejection_reason: str) -> dict:
    """Reject a pending reservation."""
    from src.main import SessionLocal
    from src.models.reservation import Reservation

    db = SessionLocal()
    try:
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.is_active == True,
        ).first()
        if not reservation:
            raise ValueError("Reserva no encontrada")

        reservation.status = "rejected"
        reservation.rejection_reason = rejection_reason
        db.commit()
        db.refresh(reservation)

        return {
            "id": reservation.id,
            "uuid": str(reservation.uuid),
            "status": reservation.status,
        }
    finally:
        db.close()


def cancel_reservation(reservation_id: int) -> dict:
    """Cancel a reservation."""
    from src.main import SessionLocal
    from src.models.reservation import Reservation

    db = SessionLocal()
    try:
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.is_active == True,
        ).first()
        if not reservation:
            raise ValueError("Reserva no encontrada")

        reservation.status = "cancelled"
        db.commit()
        db.refresh(reservation)

        return {
            "id": reservation.id,
            "uuid": str(reservation.uuid),
            "status": reservation.status,
        }
    finally:
        db.close()


def get_calendar(asset_id: int | None = None, start_date: str | None = None,
                 end_date: str | None = None) -> list[dict]:
    """Get reservations for a calendar view."""
    from src.main import SessionLocal
    from src.models.reservation import Reservation

    db = SessionLocal()
    try:
        query = db.query(Reservation).filter(
            Reservation.is_active == True,
            Reservation.status.in_(["approved", "pending"]),
        )
        if asset_id:
            query = query.filter(Reservation.asset_id == asset_id)
        if start_date:
            query = query.filter(Reservation.end_datetime >= start_date)
        if end_date:
            query = query.filter(Reservation.start_datetime <= end_date)

        reservations = query.order_by(Reservation.start_datetime).all()
        return [
            {
                "id": r.id,
                "uuid": str(r.uuid),
                "resident_id": r.resident_id,
                "asset_id": r.asset_id,
                "area_type": r.area_type,
                "area_name": r.area_name,
                "start_datetime": r.start_datetime,
                "end_datetime": r.end_datetime,
                "guests_count": r.guests_count,
                "purpose": r.purpose,
                "status": r.status,
                "approved_by": r.approved_by,
            }
            for r in reservations
        ]
    finally:
        db.close()
