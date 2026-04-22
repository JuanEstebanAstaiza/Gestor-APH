"""Notification service for financial alerts. MVP: logging only (email/WhatsApp integration pending)."""


def notify_overdue_residents() -> list[dict]:
    """Identify residents with overdue balances and generate notifications."""
    from src.main import SessionLocal
    from src.models.finance import Invoice
    from src.models.census import CensusResident

    db = SessionLocal()
    try:
        overdue_invoices = db.query(Invoice).filter(
            Invoice.is_active == True, Invoice.status == "overdue"
        ).all()

        notified = []
        for inv in overdue_invoices:
            resident = db.query(CensusResident).filter(
                CensusResident.id == inv.resident_id, CensusResident.is_active == True
            ).first()
            if resident:
                notified.append({
                    "resident_id": resident.id,
                    "asset_id": inv.asset_id,
                    "period": inv.period,
                    "amount": inv.amount,
                    "notification_type": "overdue",
                })

        # MVP: log instead of sending email
        for n in notified:
            print(f"[NOTIFICATION] Overdue: resident_id={n['resident_id']}, period={n['period']}, amount={n['amount']}")

        return notified
    finally:
        db.close()


def notify_contract_expiry() -> list[dict]:
    """Identify contracts expiring soon. MVP: placeholder."""
    return []
