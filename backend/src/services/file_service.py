import os
import uuid as uuid_lib
from datetime import datetime, timedelta, timezone

from src.config import settings

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_FILE_TYPES = {
    "pdf", "doc", "docx", "xls", "xlsx", "csv",
    "jpg", "jpeg", "png", "gif", "bmp", "tiff",
    "txt", "rtf", "zip", "rar",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def validate_file_type(file_type: str) -> bool:
    ext = file_type.split("/")[-1].lower() if "/" in file_type else file_type.lower()
    return ext in ALLOWED_FILE_TYPES


def _safe_filename(original_name: str) -> str:
    name, ext = os.path.splitext(original_name)
    safe_ext = ext.lower().lstrip(".")
    if not validate_file_type(safe_ext):
        safe_ext = "bin"
    return f"{uuid_lib.uuid4().hex}_{name}.{safe_ext}"


def upload_file(file_name: str, file_data: bytes, resident_id: int | None = None) -> dict:
    """Upload file to local filesystem (MVP). Returns file metadata."""
    safe_name = _safe_filename(file_name)
    sub_dir = f"residents/{resident_id}" if resident_id else "general"
    full_path = os.path.join(UPLOAD_DIR, sub_dir)
    os.makedirs(full_path, exist_ok=True)

    file_path = os.path.join(sub_dir, safe_name)
    full_file_path = os.path.join(UPLOAD_DIR, file_path)

    with open(full_file_path, "wb") as f:
        f.write(file_data)

    return {
        "file_name": file_name,
        "file_path": file_path,
        "file_type": file_name.split(".")[-1] if "." in file_name else "bin",
        "file_size": len(file_data),
    }


def get_signed_url(file_path: str, expiry: int = 3600) -> dict:
    """Generate signed URL for file download (MVP: returns local path)."""
    exp = datetime.now(timezone.utc) + timedelta(seconds=expiry)
    return {
        "url": f"/api/documents/download/{file_path}",
        "expires_at": exp.isoformat(),
    }


def delete_file(file_path: str) -> bool:
    """Delete file from filesystem."""
    full_path = os.path.join(UPLOAD_DIR, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False


def get_file(file_path: str) -> bytes | None:
    """Read file from filesystem."""
    full_path = os.path.join(UPLOAD_DIR, file_path)
    if os.path.exists(full_path):
        with open(full_path, "rb") as f:
            return f.read()
    return None
