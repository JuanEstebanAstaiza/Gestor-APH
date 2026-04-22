from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.communication import FAQCreate, FAQUpdate, FAQOut, FAQSearchResponse
from src.services import communication_service

router = APIRouter()


@router.get("/faq/search")
def search_faq(
    q: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    return communication_service.search_faq(q, category, page, page_size)


@router.get("/faq", response_model=list[FAQOut])
def list_faq(category: str | None = None, db: Session = Depends(get_db)):
    from src.models.communication import FAQEntry
    q = db.query(FAQEntry).filter(FAQEntry.is_active == True)
    if category:
        q = q.filter(FAQEntry.category == category)
    return q.order_by(FAQEntry.created_at.desc()).all()


@router.get("/faq/{faq_id}", response_model=FAQOut)
def get_faq(faq_id: int, db: Session = Depends(get_db)):
    from src.models.communication import FAQEntry
    entry = db.query(FAQEntry).filter(FAQEntry.id == faq_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ no encontrado")
    return entry


@router.post("/faq", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
def create_faq(body: FAQCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.communication import FAQEntry
    entry = FAQEntry(
        question=body.question,
        answer=body.answer,
        category=body.category,
        keywords=body.keywords,
        created_by=user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/faq/{faq_id}", response_model=FAQOut)
def update_faq(faq_id: int, body: FAQUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    entry = db.query(FAQEntry).filter(FAQEntry.id == faq_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ no encontrado")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/faq/{faq_id}")
def delete_faq(faq_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.communication import FAQEntry
    entry = db.query(FAQEntry).filter(FAQEntry.id == faq_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ no encontrado")
    entry.is_active = False
    db.commit()
    return {"message": "FAQ desactivado"}
