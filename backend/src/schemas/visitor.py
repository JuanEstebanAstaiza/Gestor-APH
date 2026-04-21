from pydantic import BaseModel


class VisitorCreate(BaseModel):
    first_name: str
    last_name: str
    id_document: str
    vehicle_plate: str | None = None
    resident_id: int | None = None
    notes: str | None = None


class VisitorUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    vehicle_plate: str | None = None


class VisitorOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    id_document: str
    vehicle_plate: str | None
    resident_id: int | None
    status: str
    authorized_by: int | None
    entry_time: str | None
    exit_time: str | None
    notes: str | None

    model_config = {"from_attributes": True}
