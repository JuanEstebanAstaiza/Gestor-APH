from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    parent_id: int | None = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: str | None
    parent_id: int | None

    model_config = {"from_attributes": True}
