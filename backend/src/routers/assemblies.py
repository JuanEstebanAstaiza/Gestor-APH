from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.assembly import (
    AssemblyCreate, AssemblyUpdate, AssemblyOut,
    AgendaCreate, AgendaOut,
    AttendanceCreate, AttendanceOut,
    VoteCreate, VoteOut, VoteSummary,
    MinuteCreate, MinuteUpdate, MinuteOut,
)
from src.services import assembly_service

router = APIRouter()


# === Assemblies ===

@router.get("/assemblies", response_model=list[AssemblyOut])
def list_assemblies(
    status_filter: str | None = None,
    type_filter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from src.models.assembly import Assembly

    query = db.query(Assembly).filter(Assembly.is_active == True)
    if status_filter:
        query = query.filter(Assembly.status == status_filter)
    if type_filter:
        query = query.filter(Assembly.type == type_filter)
    return query.order_by(Assembly.date.desc()).all()


@router.get("/assemblies/{assembly_id}", response_model=AssemblyOut)
def get_assembly(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Assembly

    assembly = db.query(Assembly).filter(Assembly.id == assembly_id, Assembly.is_active == True).first()
    if not assembly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asamblea no encontrada")
    return assembly


@router.post("/assemblies", response_model=AssemblyOut, status_code=status.HTTP_201_CREATED)
def create_assembly(body: AssemblyCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = assembly_service.create_assembly(
        title=body.title,
        assembly_type=body.type,
        date=body.date,
        location=body.location,
        description=body.description,
        quorum_required=body.quorum_required,
        created_by=user.id,
    )
    return result


@router.put("/assemblies/{assembly_id}", response_model=AssemblyOut)
def update_assembly(assembly_id: int, body: AssemblyUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.assembly import Assembly

    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asamblea no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(assembly, key, value)
    db.commit()
    db.refresh(assembly)
    return assembly


@router.post("/assemblies/{assembly_id}/announce")
def announce_assembly(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = assembly_service.announce_assembly(assembly_id)
    return result


# === Agendas ===

@router.get("/assemblies/{assembly_id}/agendas", response_model=list[AgendaOut])
def list_agendas(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Agenda

    agendas = db.query(Agenda).filter(
        Agenda.assembly_id == assembly_id, Agenda.is_active == True
    ).order_by(Agenda.order).all()
    return agendas


@router.post("/assemblies/{assembly_id}/agendas", response_model=AgendaOut, status_code=status.HTTP_201_CREATED)
def create_agenda(assembly_id: int, body: AgendaCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.assembly import Agenda

    agenda = Agenda(**body.model_dump())
    db.add(agenda)
    db.commit()
    db.refresh(agenda)
    return agenda


@router.delete("/assemblies/{assembly_id}/agendas/{agenda_id}")
def delete_agenda(assembly_id: int, agenda_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.assembly import Agenda

    agenda = db.query(Agenda).filter(
        Agenda.id == agenda_id, Agenda.assembly_id == assembly_id
    ).first()
    if not agenda:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agenda no encontrada")
    agenda.is_active = False
    db.commit()
    return {"message": "Agenda eliminada"}


# === Attendance ===

@router.get("/assemblies/{assembly_id}/attendance", response_model=list[AttendanceOut])
def list_attendance(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Attendance

    attendance = db.query(Attendance).filter(
        Attendance.assembly_id == assembly_id, Attendance.is_active == True
    ).all()
    return attendance


@router.post("/assemblies/{assembly_id}/attendance", response_model=AttendanceOut)
def update_attendance(assembly_id: int, body: AttendanceCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = assembly_service.update_attendance(
        assembly_id=assembly_id,
        resident_id=body.resident_id,
        status=body.status or "confirmed",
    )
    return result


@router.get("/assemblies/{assembly_id}/quorum")
def get_quorum(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = assembly_service.calculate_quorum(assembly_id)
    return result


# === Votes ===

@router.get("/assemblies/{assembly_id}/votes", response_model=list[VoteOut])
def list_votes(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Vote

    votes = db.query(Vote).filter(Vote.assembly_id == assembly_id, Vote.is_active == True).all()
    return votes


@router.get("/assemblies/{assembly_id}/votes/summary", response_model=list[VoteSummary])
def get_vote_summary(assembly_id: int, agenda_item_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    summary = assembly_service.get_vote_summary(assembly_id, agenda_item_id)
    return summary


@router.post("/assemblies/{assembly_id}/votes", response_model=VoteOut)
def submit_vote(assembly_id: int, body: VoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = assembly_service.submit_vote(
        assembly_id=assembly_id,
        agenda_item_id=body.agenda_item_id,
        voter_id=(db.query(__import__("src.models.census", fromlist=["CensusResident"]).CensusResident).filter(
            __import__("src.models.census", fromlist=["CensusResident"]).CensusResident.user_id == user.id
        ).first()).resident_id if (db.query(__import__("src.models.census", fromlist=["CensusResident"]).CensusResident).filter(
            __import__("src.models.census", fromlist=["CensusResident"]).CensusResident.user_id == user.id
        ).first()) else 0,
        option=body.option,
        notes=body.notes,
    )
    return result


# === Minutes ===

@router.get("/assemblies/{assembly_id}/minutes", response_model=list[MinuteOut])
def list_minutes(assembly_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Minute

    minutes = db.query(Minute).filter(
        Minute.assembly_id == assembly_id, Minute.is_active == True
    ).order_by(Minute.version.desc()).all()
    return minutes


@router.get("/assemblies/{assembly_id}/minutes/{minute_id}", response_model=MinuteOut)
def get_minute(assembly_id: int, minute_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.assembly import Minute

    minute = db.query(Minute).filter(
        Minute.id == minute_id, Minute.assembly_id == assembly_id, Minute.is_active == True
    ).first()
    if not minute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Acta no encontrada")
    return minute


@router.post("/assemblies/{assembly_id}/minutes", response_model=MinuteOut, status_code=status.HTTP_201_CREATED)
def create_minute(assembly_id: int, body: MinuteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = assembly_service.create_minute(
        assembly_id=assembly_id,
        title=body.title,
        content=body.content,
        file_path=body.file_path,
        created_by=user.id,
    )
    return result


@router.put("/assemblies/{assembly_id}/minutes/{minute_id}", response_model=MinuteOut)
def update_minute(assembly_id: int, minute_id: int, body: MinuteUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.assembly import Minute

    minute = db.query(Minute).filter(
        Minute.id == minute_id, Minute.assembly_id == assembly_id
    ).first()
    if not minute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Acta no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(minute, key, value)
    minute.version = (minute.version or 1) + 1
    db.commit()
    db.refresh(minute)
    return minute
