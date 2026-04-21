"""Auto-classify documents task. MVP: simple function call (background scheduler pending)."""

from src.services.document_service import auto_classify


def classify_unclassified_documents() -> dict:
    """Find documents without a category and auto-classify them."""
    from src.main import SessionLocal
    from src.models.document import Document

    db = SessionLocal()
    try:
        unclassified = db.query(Document).filter(
            Document.category_id.is_(None), Document.is_active == True
        ).all()

        classified = 0
        skipped = 0
        for doc in unclassified:
            result = auto_classify(doc.title, doc.description)
            if result["category_name"]:
                from src.models.document import DocumentCategory
                category = db.query(DocumentCategory).filter(
                    DocumentCategory.name == result["category_name"]
                ).first()
                if category:
                    doc.category_id = category.id
                    doc.classified_by = "auto"
                    classified += 1
            else:
                skipped += 1

        db.commit()
        return {"classified": classified, "skipped": skipped, "total_processed": len(unclassified)}
    finally:
        db.close()
