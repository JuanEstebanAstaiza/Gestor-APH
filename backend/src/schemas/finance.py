from pydantic import BaseModel


class AccountCreate(BaseModel):
    name: str
    bank_name: str | None = None
    account_number: str | None = None
    account_type: str | None = None
    description: str | None = None


class AccountUpdate(BaseModel):
    name: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    account_type: str | None = None
    description: str | None = None
    is_active: bool | None = None


class AccountOut(BaseModel):
    id: int
    name: str
    bank_name: str | None
    account_number: str | None
    account_type: str | None
    description: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    resident_id: int
    asset_id: int
    period: str  # YYYY-MM
    amount: str
    due_date: str
    status: str | None = None


class InvoiceUpdate(BaseModel):
    status: str | None = None
    due_date: str | None = None
    amount: str | None = None


class InvoiceOut(BaseModel):
    id: int
    uuid: str
    resident_id: int
    asset_id: int
    period: str
    amount: str
    status: str
    due_date: str
    sent_at: str | None
    paid_at: str | None
    generated_by: int | None

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    invoice_id: int
    amount: str
    payment_method: str | None = None
    reference_number: str | None = None
    payment_date: str
    notes: str | None = None


class PaymentOut(BaseModel):
    id: int
    uuid: str
    invoice_id: int
    amount: str
    payment_method: str | None
    reference_number: str | None
    payment_date: str
    processed_by: int | None
    status: str
    notes: str | None

    model_config = {"from_attributes": True}


class BalanceOut(BaseModel):
    resident_id: int
    asset_id: int
    period: str
    total_due: str
    total_paid: str
    balance: str
    months_overdue: int

    model_config = {"from_attributes": True}


class PazYSalvoOut(BaseModel):
    resident_id: int
    asset_id: int
    is_current: bool
    total_balance: str
    months_overdue: int
    generated_at: str

    model_config = {"from_attributes": True}
