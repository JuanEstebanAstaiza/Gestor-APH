from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from src.dependencies import get_db
from src.models.user import User
from src.models.refresh_token import RefreshToken
from src.schemas.auth import LoginRequest, LoginResponse, RefreshRequest, RegisterRequest, UserOut

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    user.last_login = str(__import__("datetime").datetime.now(__import__("datetime").timezone.utc))
    db.commit()

    return LoginResponse(
        access_token=create_access_token(str(user.uuid), user.role),
        refresh_token=create_refresh_token(str(user.uuid)),
    )


@router.post("/refresh")
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = verify_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user_uuid = payload.get("sub")
    token_hash = body.refresh_token  # store raw token hash for simplicity
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if not rt or rt.revoked or not rt.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revocado o expirado")

    user = db.query(User).filter(User.uuid == user_uuid).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo")

    return LoginResponse(
        access_token=create_access_token(str(user.uuid), user.role),
        refresh_token=create_refresh_token(str(user.uuid)),
    )


@router.post("/logout")
def logout(body: RefreshRequest, db: Session = Depends(get_db)):
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == body.refresh_token).first()
    if rt:
        rt.revoked = True
        db.commit()
    return {"message": "Sesión cerrada"}


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ya registrado")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
        role="residente",
        status="pending",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut.model_validate(user)


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(__import__("src.dependencies", fromlist=["get_current_user"]).get_current_user)):
    return UserOut.model_validate(user)
