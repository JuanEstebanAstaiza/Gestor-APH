from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None


class UserOut(BaseModel):
    id: int
    uuid: str
    email: str
    full_name: str
    phone: str | None
    role: str
    status: str
    is_active: bool

    model_config = {"from_attributes": True}
