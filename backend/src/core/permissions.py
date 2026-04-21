from fastapi import HTTPException, status

from src.models.user import User

ROLE_HIERARCHY = {
    "admin": 4,
    "consejo": 3,
    "vigilancia": 2,
    "residente": 1,
}


def require_role(user: User, min_role: str):
    """Check that user's role meets minimum requirement."""
    user_level = ROLE_HIERARCHY.get(user.role, 0)
    min_level = ROLE_HIERARCHY.get(min_role, 0)
    if user_level < min_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permiso denegado",
        )


def require_any_role(user: User, allowed_roles: list[str]):
    """Check that user's role is in the allowed list."""
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permiso denegado",
        )
