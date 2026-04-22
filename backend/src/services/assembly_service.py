from datetime import datetime, timezone


def create_assembly(title: str, assembly_type: str, date: str, location: str | None = None,
                    description: str | None = None, quorum_required: int = 0,
                    created_by: int = 0) -> dict:
    """Create a new assembly."""
    from src.main import SessionLocal
    from src.models.assembly import Assembly

    db = SessionLocal()
    try:
        assembly = Assembly(
            type=assembly_type,
            title=title,
            description=description,
            date=date,
            location=location,
            quorum_required=quorum_required,
            created_by=created_by,
        )
        db.add(assembly)
        db.commit()
        db.refresh(assembly)

        return {
            "id": assembly.id,
            "uuid": str(assembly.uuid),
            "status": assembly.status,
            "date": assembly.date,
        }
    finally:
        db.close()


def announce_assembly(assembly_id: int) -> dict:
    """Announce an assembly (change status to announced)."""
    from src.main import SessionLocal
    from src.models.assembly import Assembly

    db = SessionLocal()
    try:
        assembly = db.query(Assembly).filter(
            Assembly.id == assembly_id, Assembly.is_active == True
        ).first()
        if not assembly:
            raise ValueError("Asamblea no encontrada")

        assembly.status = "announced"
        assembly.announced_at = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(assembly)

        return {"id": assembly.id, "uuid": str(assembly.uuid), "status": assembly.status}
    finally:
        db.close()


def update_attendance(assembly_id: int, resident_id: int, status: str) -> dict:
    """Update or create attendance record for a resident."""
    from src.main import SessionLocal
    from src.models.assembly import Attendance

    db = SessionLocal()
    try:
        record = db.query(Attendance).filter(
            Attendance.assembly_id == assembly_id,
            Attendance.resident_id == resident_id,
        ).first()

        if record:
            record.status = status
            if status == "confirmed":
                record.confirmed_at = datetime.now(timezone.utc).isoformat()
        else:
            record = Attendance(
                assembly_id=assembly_id,
                resident_id=resident_id,
                status=status,
                confirmed_at=datetime.now(timezone.utc).isoformat() if status == "confirmed" else None,
            )
            db.add(record)

        db.commit()
        db.refresh(record)

        return {"id": record.id, "assembly_id": record.assembly_id, "resident_id": record.resident_id, "status": record.status}
    finally:
        db.close()


def calculate_quorum(assembly_id: int) -> dict:
    """Calculate current quorum for an assembly."""
    from src.main import SessionLocal
    from src.models.assembly import Assembly, Attendance
    from src.models.census import CensusResident

    db = SessionLocal()
    try:
        assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
        if not assembly:
            raise ValueError("Asamblea no encontrada")

        total_residents = db.query(CensusResident).filter(CensusResident.is_active == True).count()
        confirmed = db.query(Attendance).filter(
            Attendance.assembly_id == assembly_id, Attendance.status == "confirmed"
        ).count()

        percentage = (confirmed / total_residents * 100) if total_residents > 0 else 0
        achieved = percentage >= assembly.quorum_required if assembly.quorum_required > 0 else False

        return {
            "assembly_id": assembly_id,
            "total_residents": total_residents,
            "confirmed": confirmed,
            "declined": db.query(Attendance).filter(
                Attendance.assembly_id == assembly_id, Attendance.status == "declined"
            ).count(),
            "pending": db.query(Attendance).filter(
                Attendance.assembly_id == assembly_id, Attendance.status == "pending"
            ).count(),
            "percentage": round(percentage, 2),
            "quorum_required": assembly.quorum_required,
            "quorum_achieved": achieved,
        }
    finally:
        db.close()


def submit_vote(assembly_id: int, agenda_item_id: int | None, voter_id: int,
                option: str, notes: str | None = None) -> dict:
    """Submit a vote for an agenda item."""
    from src.main import SessionLocal
    from src.models.assembly import Vote, Attendance

    db = SessionLocal()
    try:
        # Check resident is confirmed attendee
        attendance = db.query(Attendance).filter(
            Attendance.assembly_id == assembly_id,
            Attendance.resident_id == voter_id,
            Attendance.status == "confirmed",
        ).first()
        if not attendance:
            raise ValueError("El residente no tiene asistencia confirmada a esta asamblea")

        # Check no existing vote
        existing = db.query(Vote).filter(
            Vote.assembly_id == assembly_id,
            Vote.voter_id == voter_id,
        ).first()
        if existing:
            raise ValueError("El residente ya ha votado en esta asamblea")

        vote = Vote(
            assembly_id=assembly_id,
            agenda_item_id=agenda_item_id,
            voter_id=voter_id,
            option=option,
            notes=notes,
        )
        db.add(vote)
        db.commit()
        db.refresh(vote)

        return {"id": vote.id, "option": vote.option, "voted_at": vote.voted_at}
    finally:
        db.close()


def get_vote_summary(assembly_id: int, agenda_item_id: int | None = None) -> list[dict]:
    """Get vote summary for agenda items."""
    from src.main import SessionLocal
    from src.models.assembly import Vote, Agenda

    db = SessionLocal()
    try:
        query = db.query(Vote).filter(Vote.assembly_id == assembly_id, Vote.is_active == True)
        if agenda_item_id:
            query = query.filter(Vote.agenda_item_id == agenda_item_id)

        votes = query.all()
        grouped = {}
        for v in votes:
            key = v.agenda_item_id
            if key not in grouped:
                grouped[key] = {"favor": 0, "en_contra": 0, "abstencion": 0}
            grouped[key][v.option] += 1

        result = []
        for item_id, counts in grouped.items():
            agenda = db.query(Agenda).filter(Agenda.id == item_id).first() if item_id else None
            result.append({
                "agenda_item_id": item_id,
                "topic": agenda.topic if agenda else None,
                "favor": counts["favor"],
                "en_contra": counts["en_contra"],
                "abstencion": counts["abstencion"],
                "total": sum(counts.values()),
            })
        return result
    finally:
        db.close()


def create_minute(assembly_id: int, title: str, content: str, file_path: str | None = None,
                  created_by: int = 0) -> dict:
    """Create a minute (acta) for an assembly."""
    from src.main import SessionLocal
    from src.models.assembly import Minute

    db = SessionLocal()
    try:
        minute = Minute(
            assembly_id=assembly_id,
            title=title,
            content=content,
            file_path=file_path,
            created_by=created_by,
        )
        db.add(minute)
        db.commit()
        db.refresh(minute)

        return {
            "id": minute.id,
            "uuid": str(minute.uuid),
            "title": minute.title,
            "version": minute.version,
        }
    finally:
        db.close()
