"""Communication service: PQRS, FAQ, Circulars. MVP: email integration pending."""


def create_pqrs(requester_id: int, ptype: str, subject: str, description: str, category: str | None = None, priority: str | None = None) -> dict:
    """Create a new PQRS ticket."""
    import uuid as uuid_lib
    from src.main import SessionLocal
    from src.models.communication import PQRS

    db = SessionLocal()
    try:
        pqrs = PQRS(
            requester_id=requester_id,
            type=ptype,
            category=category,
            subject=subject,
            description=description,
            priority=priority or "normal",
        )
        db.add(pqrs)
        db.commit()
        db.refresh(pqrs)
        return {
            "id": pqrs.id,
            "uuid": str(pqrs.uuid),
            "status": pqrs.status,
        }
    finally:
        db.close()


def update_pqrs_status(pqrs_id: int, status: str, response: str | None = None) -> dict:
    """Update PQRS status and optionally add response."""
    from src.main import SessionLocal
    from src.models.communication import PQRS

    db = SessionLocal()
    try:
        pqrs = db.query(PQRS).filter(PQRS.id == pqrs_id).first()
        if not pqrs:
            raise ValueError("PQRS not found")

        pqrs.status = status
        if response:
            pqrs.response = response
        if status in ("resolved", "closed"):
            pqrs.resolved_at = __import__("datetime", fromlist=["datetime"]).datetime.now(__import__("datetime", fromlist=["timezone"]).timezone.utc).isoformat()
        db.commit()
        db.refresh(pqrs)
        return {
            "id": pqrs.id,
            "uuid": str(pqrs.uuid),
            "status": pqrs.status,
            "resolved_at": pqrs.resolved_at,
        }
    finally:
        db.close()


def search_faq(query: str, category: str | None = None, page: int = 1, page_size: int = 20) -> dict:
    """Search FAQ entries by query and category."""
    from src.main import SessionLocal
    from src.models.communication import FAQEntry

    db = SessionLocal()
    try:
        q = db.query(FAQEntry).filter(FAQEntry.is_active == True)
        if category:
            q = q.filter(FAQEntry.category == category)
        if query:
            search_term = f"%{query}%"
            q = q.filter(FAQEntry.question.ilike(search_term) | FAQEntry.answer.ilike(search_term))

        total = q.count()
        entries = q.order_by(FAQEntry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

        return {
            "data": [
                {
                    "id": e.id,
                    "question": e.question,
                    "answer": e.answer,
                    "category": e.category,
                    "keywords": e.keywords,
                    "is_active": e.is_active,
                }
                for e in entries
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total,
        }
    finally:
        db.close()


def create_circular(title: str, content: str, target_type: str | None = None, target_value: str | None = None, sent_by: int | None = None) -> dict:
    """Create a new circular."""
    import uuid as uuid_lib
    from src.main import SessionLocal
    from src.models.communication import Circular

    db = SessionLocal()
    try:
        circular = Circular(
            title=title,
            content=content,
            target_type=target_type,
            target_value=target_value,
            status="draft",
            sent_by=sent_by,
        )
        db.add(circular)
        db.commit()
        db.refresh(circular)
        return {
            "id": circular.id,
            "uuid": str(circular.uuid),
            "status": circular.status,
        }
    finally:
        db.close()


def send_circular(circular_id: int) -> dict:
    """Mark circular as sent. MVP: only updates status (email integration pending)."""
    from src.main import SessionLocal
    from src.models.communication import Circular

    db = SessionLocal()
    try:
        circular = db.query(Circular).filter(Circular.id == circular_id).first()
        if not circular:
            raise ValueError("Circular not found")

        circular.status = "sent"
        circular.sent_at = __import__("datetime", fromlist=["datetime"]).datetime.now(__import__("datetime", fromlist=["timezone"]).timezone.utc).isoformat()
        db.commit()
        db.refresh(circular)

        # MVP: log instead of sending email
        print(f"[CIRCULAR] Sent: id={circular.id}, title={circular.title}, target={circular.target_type}")
        return {
            "id": circular.id,
            "uuid": str(circular.uuid),
            "status": circular.status,
            "sent_at": circular.sent_at,
        }
    finally:
        db.close()


def send_communication(sender_id: int, recipient_id: int, comm_type: str, subject: str | None, content: str) -> dict:
    """Send a communication (email/whatsapp/notification). MVP: logging only."""
    from src.main import SessionLocal
    from src.models.communication import Communication

    db = SessionLocal()
    try:
        comm = Communication(
            sender_id=sender_id,
            recipient_id=recipient_id,
            type=comm_type,
            subject=subject,
            content=content,
            status="sent",
            sent_at=__import__("datetime", fromlist=["datetime"]).datetime.now(__import__("datetime", fromlist=["timezone"]).timezone.utc).isoformat(),
        )
        db.add(comm)
        db.commit()
        db.refresh(comm)

        print(f"[COMMUNICATION] {comm_type}: sender={sender_id}, recipient={recipient_id}")
        return {
            "id": comm.id,
            "type": comm.type,
            "status": comm.status,
        }
    finally:
        db.close()
