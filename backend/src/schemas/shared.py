from pydantic import BaseModel


class PaginatedResponse(BaseModel):
    data: list
    total: int
    page: int
    page_size: int
    has_next: bool


class MessageResponse(BaseModel):
    message: str
