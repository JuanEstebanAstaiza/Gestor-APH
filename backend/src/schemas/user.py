from pydantic import BaseModel, EmailStr

from src.schemas.shared import MessageResponse


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    role: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    full_name: str | None = None
    phone: str | None = None
    role: str | None = None
    status: str | None = None


class UserListResponse(BaseModel):
    data: list["UserOut"]
    total: int
    page: int
    page_size: int
    has_next: bool


from src.schemas.auth import UserOut

UserListResponse.model_rebuild()
