import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.core.permissions import require_any_role
from src.dependencies import get_current_user, get_db
from src.models.user import User
from src.models.document import Document, DocumentCategory
from src.schemas.document import DocumentCreate, DocumentOut, DocumentUpdate

router = APIRouter()


@router.get("")
def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Document).filter(Document.created_by == current_user.id)
    if category_id:
        query = query.filter(Document.category_id == category_id)

    total = query.count()
    data = (
        query.order_by(Document.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [DocumentOut.model_validate(d) for d in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.get("/search")
def search_documents(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Document).filter(
        Document.created_by == current_user.id,
        Document.title.ilike(f"%{q}%"),
    )

    total = query.count()
    data = (
        query.order_by(Document.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "data": [DocumentOut.model_validate(d) for d in data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total,
    }


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    return DocumentOut.model_validate(doc)


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    title: str = Query(...),
    description: str | None = Query(None),
    category_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # MVP: store file locally; replace with S3/R2 later
    file_path = f"/uploads/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)

    doc = Document(
        title=title,
        description=description,
        file_path=file_path,
        file_type=file.filename.split(".")[-1] if "." in file.filename else None,
        file_size=len(content),
        category_id=category_id,
        created_by=current_user.id,
        classified_by="admin",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


@router.patch("/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: int,
    body: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(doc, key, value)

    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


@router.post("/{document_id}/share")
def share_document(
    document_id: int,
    body: dict = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")

    token = str(uuid.uuid4()).replace("-", "")[:64]
    doc.share_token = token
    doc.is_public = True
    if expires := body.get("expires_days"):
        from datetime import datetime, timezone, timedelta
        doc.share_expires_at = str(datetime.now(timezone.utc) + timedelta(days=expires))
    db.commit()
    return {"share_token": token, "share_url": f"/api/documents/share/{token}"}


@router.get("/share/{token}")
def public_share_view(
    token: str,
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.share_token == token).first()
    if not doc or not doc.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no disponible")
    return DocumentOut.model_validate(doc)
