from pydantic import BaseModel


class ReservationCreate(BaseModel):
    resident_id: int
    asset_id: int
    area_type: str
    area_name: str
    start_datetime: str
    end_datetime: str
    guests_count: int = 0
    purpose: str | None = None


class ReservationUpdate(BaseModel):
    status: str | None = None
    approved_by: int | None = None
    approved_at: str | None = None
    rejection_reason: str | None = None


class ReservationOut(BaseModel):
    id: int
    uuid: str
    resident_id: int
    asset_id: int
    area_type: str
    area_name: str
    start_datetime: str
    end_datetime: str
    guests_count: int
    purpose: str | None
    status: str
    approved_by: int | None
    approved_at: str | None
    rejection_reason: str | None
    balance_check: bool
    is_active: bool

    model_config = {"from_attributes": True}


class InfractionCreate(BaseModel):
    resident_id: int
    asset_id: int
    category: str
    description: str
    severity: str
    fine_amount: str | None = None


class InfractionUpdate(BaseModel):
    status: str | None = None
    acknowledged_at: str | None = None
    resolved_at: str | None = None
    fine_amount: str | None = None


class InfractionOut(BaseModel):
    id: int
    uuid: str
    resident_id: int
    asset_id: int
    category: str
    description: str
    severity: str
    warning_count: int
    fine_amount: str | None
    status: str
    issued_by: int
    acknowledged_at: str | None
    resolved_at: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class RegulationCreate(BaseModel):
    title: str
    content: str
    section_number: str | None = None
    chapter: str | None = None
    order: int | None = None


class RegulationUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    section_number: str | None = None
    chapter: str | None = None
    order: int | None = None
    is_active: bool | None = None


class RegulationOut(BaseModel):
    id: int
    title: str
    content: str
    section_number: str | None
    chapter: str | None
    order: int | None
    is_active: bool

    model_config = {"from_attributes": True}
