from pydantic import BaseModel


class DocumentCreate(BaseModel):
    title: str
    description: str | None = None
    category_id: int | None = None


class DocumentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: int | None = None
    is_public: bool | None = None


class DocumentOut(BaseModel):
    id: int
    uuid: str
    title: str
    description: str | None
    file_path: str
    file_type: str | None
    file_size: int | None
    category_id: int | None
    source_type: str | None
    classified_by: str | None
    is_public: bool
    share_token: str | None
    share_expires_at: str | None
    created_by: int

    model_config = {"from_attributes": True}


class DocumentSearchResponse(BaseModel):
    data: list["DocumentOut"]
    total: int
    page: int
    page_size: int
    has_next: bool


from src.schemas.document import DocumentOut

DocumentSearchResponse.model_rebuild()
