from pydantic import BaseModel


class ProviderCreate(BaseModel):
    name: str
    type: str
    specialty: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None


class ProviderUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    specialty: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class ProviderOut(BaseModel):
    id: int
    uuid: str
    name: str
    type: str
    specialty: str | None
    contact_name: str | None
    phone: str | None
    email: str | None
    address: str | None
    notes: str | None
    is_active: bool
    created_by: int | None

    model_config = {"from_attributes": True}


class ContractCreate(BaseModel):
    provider_id: int
    contract_name: str
    description: str | None = None
    start_date: str
    end_date: str | None = None
    value: str | None = None
    status: str | None = None
    renewal_notice_days: int | None = None


class ContractUpdate(BaseModel):
    contract_name: str | None = None
    description: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    value: str | None = None
    status: str | None = None
    renewal_notice_days: int | None = None
    is_active: bool | None = None


class ContractOut(BaseModel):
    id: int
    provider_id: int
    contract_name: str
    description: str | None
    start_date: str
    end_date: str | None
    value: str | None
    status: str
    renewal_notice_days: int
    is_active: bool
    created_by: int | None

    model_config = {"from_attributes": True}


class AlertCreate(BaseModel):
    asset_id: int
    alert_type: str
    description: str
    scheduled_date: str
    provider_id: int | None = None
    notes: str | None = None


class AlertUpdate(BaseModel):
    status: str | None = None
    description: str | None = None
    scheduled_date: str | None = None
    notes: str | None = None


class AlertOut(BaseModel):
    id: int
    uuid: str
    asset_id: int
    provider_id: int | None
    alert_type: str
    description: str
    scheduled_date: str
    status: str
    notified_at: str | None
    completed_at: str | None
    notified_to: int | None
    notes: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class AlertSummary(BaseModel):
    asset_id: int
    asset_unit_number: str
    asset_type: str
    pending_count: int
    overdue_count: int
    upcoming_count: int


class PaginatedAlertsResponse(BaseModel):
    data: list[AlertOut]
    total: int
    page: int
    page_size: int
    has_next: bool


class AlertDashboardSummary(BaseModel):
    alerts: list[AlertOut]
    summary: list[AlertSummary]
    total_pending: int
    total_overdue: int
    total_completed: int
