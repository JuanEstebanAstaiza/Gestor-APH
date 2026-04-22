from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.finance import (
    AccountCreate, AccountUpdate, AccountOut,
    InvoiceCreate, InvoiceUpdate, InvoiceOut,
    PaymentCreate, PaymentOut,
    BalanceOut, PazYSalvoOut,
)
from src.services import finance_service, notification_service

router = APIRouter()


# Accounts
@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(__import__("src.models.finance", fromlist=["Account"]).Account).filter(
        __import__("src.models.finance", fromlist=["Account"]).Account.is_active == True
    ).all()


@router.post("/accounts", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(body: AccountCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "admin")
    account = __import__("src.models.finance", fromlist=["Account"]).Account(**body.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.put("/accounts/{account_id}", response_model=AccountOut)
def update_account(account_id: int, body: AccountUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "admin")
    account = db.query(__import__("src.models.finance", fromlist=["Account"]).Account).filter(
        __import__("src.models.finance", fromlist=["Account"]).Account.id == account_id
    ).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuenta no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account


# Invoices
@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(
    resident_id: int | None = None,
    period: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(__import__("src.models.finance", fromlist=["Invoice"]).Invoice).filter(
        __import__("src.models.finance", fromlist=["Invoice"]).Invoice.is_active == True
    )
    if resident_id:
        query = query.filter(__import__("src.models.finance", fromlist=["Invoice"]).Invoice.resident_id == resident_id)
    if period:
        query = query.filter(__import__("src.models.finance", fromlist=["Invoice"]).Invoice.period == period)
    if status_filter:
        query = query.filter(__import__("src.models.finance", fromlist=["Invoice"]).Invoice.status == status_filter)
    return query.order_by(__import__("src.models.finance", fromlist=["Invoice"]).Invoice.period.desc()).all()


@router.post("/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(body: InvoiceCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    invoice = __import__("src.models.finance", fromlist=["Invoice"]).Invoice(**body.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.put("/invoices/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, body: InvoiceUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    invoice = db.query(__import__("src.models.finance", fromlist=["Invoice"]).Invoice).filter(
        __import__("src.models.finance", fromlist=["Invoice"]).Invoice.id == invoice_id
    ).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/invoices/generate")
def generate_invoices(body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    period = body.get("period")
    if not period:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Period required (YYYY-MM)")
    return finance_service.generate_invoices_for_period(period)


# Payments
@router.get("/payments", response_model=list[PaymentOut])
def list_payments(invoice_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(__import__("src.models.finance", fromlist=["Payment"]).Payment).filter(
        __import__("src.models.finance", fromlist=["Payment"]).Payment.is_active == True
    )
    if invoice_id:
        query = query.filter(__import__("src.models.finance", fromlist=["Payment"]).Payment.invoice_id == invoice_id)
    return query.order_by(__import__("src.models.finance", fromlist=["Payment"]).Payment.payment_date.desc()).all()


@router.post("/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(body: PaymentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return finance_service.process_payment(
        invoice_id=body.invoice_id,
        amount=body.amount,
        payment_method=body.payment_method,
        reference=body.reference_number,
        payment_date=body.payment_date,
    )


# Balance
@router.get("/balance/{resident_id}", response_model=BalanceOut)
def get_balance(resident_id: int, period: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return finance_service.get_balance(resident_id, period)


# Paz y Salvo
@router.get("/paz-y-salvo/{resident_id}", response_model=PazYSalvoOut)
def get_paz_y_salvo(resident_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return finance_service.get_paz_y_salvo(resident_id)


# Financial report
@router.get("/report")
def get_financial_report(
    resident_id: int | None = None,
    period: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return finance_service.get_financial_report(resident_id, period)


# Notifications
@router.post("/notify-overdue")
def notify_overdue(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    return notification_service.notify_overdue_residents()
