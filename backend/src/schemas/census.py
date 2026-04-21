from pydantic import BaseModel


class CensusResidentCreate(BaseModel):
    user_id: int | None = None
    property_type: str
    move_in_date: str | None = None
    move_out_date: str | None = None
    lease_end: str | None = None


class CensusResidentUpdate(BaseModel):
    property_type: str | None = None
    move_in_date: str | None = None
    move_out_date: str | None = None
    lease_end: str | None = None
    is_active: bool | None = None


class CensusResidentOut(BaseModel):
    id: int
    user_id: int | None
    property_type: str
    move_in_date: str | None
    move_out_date: str | None
    lease_end: str | None
    is_active: bool

    model_config = {"from_attributes": True}
