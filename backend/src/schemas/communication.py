from pydantic import BaseModel


class PQRSCreate(BaseModel):
    requester_id: int
    type: str
    category: str | None = None
    subject: str
    description: str
    priority: str | None = None


class PQRSUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None
    assigned_to: int | None = None
    response: str | None = None


class PQRSOut(BaseModel):
    id: int
    uuid: str
    requester_id: int
    type: str
    category: str | None
    subject: str
    description: str
    status: str
    priority: str
    assigned_to: int | None
    resolved_at: str | None
    response: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str | None = None
    keywords: list[str] | None = None


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    category: str | None = None
    keywords: list[str] | None = None
    is_active: bool | None = None


class FAQOut(BaseModel):
    id: int
    question: str
    answer: str
    category: str | None
    keywords: list[str] | None
    is_active: bool

    model_config = {"from_attributes": True}


class FAQSearchResponse(BaseModel):
    data: list["FAQOut"]
    total: int
    page: int
    page_size: int
    has_next: bool


class CircularCreate(BaseModel):
    title: str
    content: str
    target_type: str | None = None
    target_value: str | None = None
    status: str | None = None


class CircularUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    target_type: str | None = None
    target_value: str | None = None
    status: str | None = None


class CircularOut(BaseModel):
    id: int
    uuid: str
    title: str
    content: str
    target_type: str | None
    target_value: str | None
    status: str
    sent_at: str | None
    sent_by: int | None

    model_config = {"from_attributes": True}


class CommunicationOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    type: str
    subject: str | None
    content: str
    status: str
    sent_at: str | None

    model_config = {"from_attributes": True}


from src.schemas.communication import FAQOut
FAQSearchResponse.model_rebuild()
