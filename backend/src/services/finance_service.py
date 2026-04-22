from datetime import date, datetime, timezone

from src.services.file_service import upload_file


def generate_invoices_for_period(period: str) -> list[dict]:
    """Generate invoices for all active residents for a given period (YYYY-MM)."""
    from src.main import SessionLocal
    from src.models.census import CensusResident
    from src.models.resident_asset import ResidentAsset
    from src.models.asset import Asset
    from src.models.finance import Invoice

    db = SessionLocal()
    try:
        residents = db.query(CensusResident).filter(
            CensusResident.is_active == True
        ).all()

        invoices = []
        for resident in residents:
            links = db.query(ResidentAsset).filter(
                ResidentAsset.resident_id == resident.id, ResidentAsset.is_active == True
            ).all()

            for link in links:
                asset = db.query(Asset).filter(Asset.id == link.asset_id).first()
                if not asset:
                    continue

                existing = db.query(Invoice).filter(
                    Invoice.resident_id == resident.id,
                    Invoice.asset_id == asset.id,
                    Invoice.period == period,
                    Invoice.is_active == True,
                ).first()
                if existing:
                    continue

                invoice = Invoice(
                    resident_id=resident.id,
                    asset_id=asset.id,
                    period=period,
                    amount="0",  # default, admin sets actual amount
                    due_date=date.fromisoformat(period + "-28").isoformat(),
                )
                db.add(invoice)
                invoices.append(invoice)

        db.commit()
        return [{"id": inv.id, "period": period} for inv in invoices]
    finally:
        db.close()


def process_payment(invoice_id: int, amount: str, payment_method: str | None, reference: str | None, payment_date: str) -> dict:
    """Record a payment against an invoice."""
    from src.main import SessionLocal
    from src.models.finance import Payment, Invoice
    from src.dependencies import get_current_user

    db = SessionLocal()
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.is_active == True).first()
        if not invoice:
            raise ValueError("Invoice not found")

        payment = Payment(
            invoice_id=invoice_id,
            amount=amount,
            payment_method=payment_method,
            reference_number=reference,
            payment_date=payment_date,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Update invoice status if fully paid
        total_paid = sum(
            float(p.amount) for p in db.query(Payment).filter(
                Payment.invoice_id == invoice_id, Payment.is_active == True, Payment.status == "verified"
            ).all()
        )
        if total_paid >= float(invoice.amount):
            invoice.status = "paid"
            invoice.paid_at = datetime.now(timezone.utc).isoformat()
            db.commit()

        return {
            "id": payment.id,
            "uuid": str(payment.uuid),
            "amount": payment.amount,
            "status": payment.status,
        }
    finally:
        db.close()


def get_balance(resident_id: int, period: str | None = None) -> dict:
    """Compute current balance for a resident."""
    from src.main import SessionLocal
    from src.models.finance import Invoice, Payment
    from src.models.resident_asset import ResidentAsset

    db = SessionLocal()
    try:
        links = db.query(ResidentAsset).filter(
            ResidentAsset.resident_id == resident_id, ResidentAsset.is_active == True
        ).all()

        total_due = 0
        total_paid = 0
        months_overdue = 0
        asset_ids = [link.asset_id for link in links]

        query = db.query(Invoice).filter(
            Invoice.resident_id == resident_id, Invoice.is_active == True
        )
        if period:
            query = query.filter(Invoice.period <= period)

        invoices = query.all()
        for inv in invoices:
            total_due += float(inv.amount)
            if inv.status in ("overdue", "pending"):
                months_overdue += 1

        payments = db.query(Payment).filter(
            Payment.invoice_id.in_([inv.id for inv in invoices]),
            Payment.is_active == True, Payment.status == "verified",
        ).all()
        total_paid = sum(float(p.amount) for p in payments)

        balance = total_due - total_paid

        # Store balance record
        from src.models.finance import BalanceRecord
        record = BalanceRecord(
            resident_id=resident_id,
            asset_id=asset_ids[0] if asset_ids else 0,
            period=period or date.today().strftime("%Y-%m"),
            total_due=total_due,
            total_paid=total_paid,
            balance=balance,
            months_overdue=months_overdue,
        )
        db.add(record)
        db.commit()

        return {
            "resident_id": resident_id,
            "total_due": str(total_due),
            "total_paid": str(total_paid),
            "balance": str(balance),
            "months_overdue": months_overdue,
        }
    finally:
        db.close()


def get_paz_y_salvo(resident_id: int) -> dict:
    """Generate paz y salvo certificate if resident is current on payments."""
    from src.main import SessionLocal
    from src.models.finance import Invoice, Payment
    from src.models.resident_asset import ResidentAsset

    db = SessionLocal()
    try:
        balance = get_balance(resident_id)

        is_current = balance["balance"] == "0" and balance["months_overdue"] == 0

        return {
            "resident_id": resident_id,
            "is_current": is_current,
            "total_balance": balance["balance"],
            "months_overdue": balance["months_overdue"],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    finally:
        db.close()


def get_financial_report(resident_id: int | None = None, period: str | None = None) -> dict:
    """Get financial report with invoices and payments."""
    from src.main import SessionLocal
    from src.models.finance import Invoice, Payment

    db = SessionLocal()
    try:
        query = db.query(Invoice).filter(Invoice.is_active == True)
        if resident_id:
            query = query.filter(Invoice.resident_id == resident_id)
        if period:
            query = query.filter(Invoice.period == period)

        invoices = query.order_by(Invoice.period.desc()).all()
        invoice_ids = [inv.id for inv in invoices]

        payments = db.query(Payment).filter(
            Payment.invoice_id.in_(invoice_ids), Payment.is_active == True
        ).all() if invoice_ids else []

        return {
            "invoices": [
                {
                    "id": inv.id,
                    "uuid": str(inv.uuid),
                    "period": inv.period,
                    "amount": inv.amount,
                    "status": inv.status,
                    "due_date": inv.due_date,
                    "paid_at": inv.paid_at,
                }
                for inv in invoices
            ],
            "payments": [
                {
                    "id": p.id,
                    "invoice_id": p.invoice_id,
                    "amount": p.amount,
                    "payment_date": p.payment_date,
                    "status": p.status,
                }
                for p in payments
            ],
        }
    finally:
        db.close()
