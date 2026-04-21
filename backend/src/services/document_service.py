import uuid as uuid_lib
from datetime import datetime, timedelta, timezone

_KEYWORD_MAP = {
    "Acta": "Actas",
    "Asamblea": "Actas",
    "Consejo": "Actas",
    "Votacion": "Actas",
    "Voto": "Actas",
    "Reglamento": "Reglamentos",
    "Norma": "Reglamentos",
    "Politica": "Reglamentos",
    "Financiero": "Financiero",
    "Factura": "Financiero",
    "Cuenta": "Financiero",
    "Balance": "Financiero",
    "Pago": "Financiero",
    "Tecnico": "Tecnico",
    "Informe": "Tecnico",
    "Mantenimiento": "Tecnico",
    "Inspeccion": "Tecnico",
    "Legal": "Legal",
    "Contrato": "Legal",
    "Juridico": "Legal",
    "Circular": "Comunicacion",
    "Aviso": "Comunicacion",
    "Comunicacion": "Comunicacion",
    "Censo": "Censo",
    "Propietario": "Censo",
    "Residente": "Censo",
}


def auto_classify(title: str, description: str | None = None) -> dict:
    """Classify document by keywords in title and description. Returns category match."""
    text = (title + " " + (description or "")).title()
    for keyword, category_name in _KEYWORD_MAP.items():
        if keyword in text:
            return {"category_name": category_name, "classified_by": "auto"}

    return {"category_name": None, "classified_by": "manual_required"}


def smart_search(
    query: str,
    user_id: int | None = None,
    category_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """Search documents with filters. MVP: basic text search."""
    from src.main import SessionLocal
    from src.models.document import Document

    db = SessionLocal()
    try:
        q = db.query(Document).filter(Document.is_active == True)

        if category_id:
            q = q.filter(Document.category_id == category_id)

        if query:
            search_term = f"%{query}%"
            q = q.filter(
                Document.title.ilike(search_term) | Document.description.ilike(search_term)
            )

        total = q.count()
        docs = q.order_by(Document.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

        return {
            "data": [
                {
                    "id": d.id,
                    "uuid": str(d.uuid),
                    "title": d.title,
                    "description": d.description,
                    "file_path": d.file_path,
                    "file_type": d.file_type,
                    "file_size": d.file_size,
                    "category_id": d.category_id,
                    "source_type": d.source_type,
                    "classified_by": d.classified_by,
                    "is_public": d.is_public,
                    "share_token": d.share_token,
                    "share_expires_at": d.share_expires_at,
                    "created_by": d.created_by,
                }
                for d in docs
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total,
        }
    finally:
        db.close()


def generate_share_token(document_id: int) -> dict | None:
    """Generate a share token for a document."""
    from src.main import SessionLocal
    from src.models.document import Document

    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return None

        token = uuid_lib.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        doc.share_token = token
        doc.share_expires_at = expires_at.isoformat()
        db.commit()

        return {"share_token": token, "share_url": f"/api/documents/share/{token}", "expires_at": expires_at.isoformat()}
    finally:
        db.close()


def revoke_share_token(document_id: int) -> bool:
    """Revoke a document's share token."""
    from src.main import SessionLocal
    from src.models.document import Document

    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return False

        doc.share_token = None
        doc.share_expires_at = None
        db.commit()
        return True
    finally:
        db.close()


def create_document_version(document_id: int, file_path: str, user_id: int, note: str | None = None) -> dict:
    """Create a new version of a document."""
    from src.main import SessionLocal
    from src.models.document import DocumentVersion

    db = SessionLocal()
    try:
        latest = db.query(DocumentVersion).filter(
            DocumentVersion.document_id == document_id
        ).order_by(DocumentVersion.version_num.desc()).first()
        next_version = (latest.version_num + 1) if latest else 1

        version = DocumentVersion(
            document_id=document_id,
            file_path=file_path,
            version_num=next_version,
            changed_by=user_id,
            change_note=note,
        )
        db.add(version)
        db.commit()
        db.refresh(version)

        return {
            "id": version.id,
            "version_num": version.version_num,
            "file_path": version.file_path,
            "changed_by": version.changed_by,
            "change_note": version.change_note,
        }
    finally:
        db.close()
