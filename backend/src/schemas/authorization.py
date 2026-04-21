from pydantic import BaseModel


class AuthorizationCreate(BaseModel):
    target_type: str
    target_desc: str
    expiry_date: str | None = None
    notes: str | None = None


class AuthorizationOut(BaseModel):
    id: int
    requester_id: int
    target_type: str
    target_desc: str
    status: str
    approved_by: int | None
    approved_at: str | None
    expiry_date: str | None
    notes: str | None

    model_config = {"from_attributes": True}
