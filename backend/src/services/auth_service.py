import uuid as uuid_lib
from datetime import datetime, timedelta, timezone

from src.config import settings
from src.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token


def generate_admin_seed() -> dict | None:
    """Create initial admin user if none exists."""
    from src.main import SessionLocal
    from src.models.user import User

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(
            User.role == "admin", User.is_active == True
        ).first()
        if existing_admin:
            return None

        admin = User(
            email="admin@altura.ph",
            password_hash=hash_password("admin123"),
            full_name="Administrador",
            role="admin",
            status="active",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        return {
            "email": admin.email,
            "password": "admin123",
            "uuid": str(admin.uuid),
        }
    finally:
        db.close()


def forgot_password(email: str) -> dict | None:
    """Generate password reset token. MVP: returns token (email integration pending)."""
    from src.main import SessionLocal
    from src.models.user import User

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user:
            return None

        expire = datetime.now(timezone.utc) + timedelta(hours=1)
        payload = {
            "sub": str(user.uuid),
            "type": "reset_password",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        token = __import__("src.core.security", fromlist=["jwt"]).jwt.encode(
            payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

        return {"token": token, "expires_in": 3600}
    finally:
        db.close()


def reset_password(token: str, new_password: str) -> bool:
    """Validate reset token and update password."""
    from src.main import SessionLocal
    from src.models.user import User

    db = SessionLocal()
    try:
        payload = verify_token(token)
        if not payload or payload.get("type") != "reset_password":
            return False

        expire = payload.get("exp")
        if expire:
            exp_dt = datetime.fromtimestamp(expire, tz=timezone.utc)
            if datetime.now(timezone.utc) > exp_dt:
                return False

        user_uuid = payload.get("sub")
        user = db.query(User).filter(User.uuid == user_uuid, User.is_active == True).first()
        if not user:
            return False

        user.password_hash = hash_password(new_password)
        db.commit()
        return True
    finally:
        db.close()
