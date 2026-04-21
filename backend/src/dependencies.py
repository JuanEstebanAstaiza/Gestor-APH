from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.config import settings
from src.core.security import verify_token
from src.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    """Yield a database session."""
    from src.main import engine, SessionLocal

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and verify JWT, return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    user_uuid: str = payload.get("sub")
    if user_uuid is None:
        raise credentials_exception

    user = db.query(User).filter(User.uuid == user_uuid).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user
