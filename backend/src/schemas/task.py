from pydantic import BaseModel


class TaskCreate(BaseModel):
    assembly_id: int | None = None
    title: str
    description: str
    assigned_to: int
    deadline: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    deadline: str | None = None
    completed_at: str | None = None
    notes: str | None = None


class TaskOut(BaseModel):
    id: int
    uuid: str
    assembly_id: int | None
    title: str
    description: str
    assigned_to: int
    deadline: str | None
    status: str
    completed_at: str | None
    notes: str | None
    is_active: bool

    model_config = {"from_attributes": True}
