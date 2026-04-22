from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.dependencies import get_db, get_current_user
from src.core.permissions import require_role
from src.models.user import User
from src.schemas.reservation import (
    ReservationCreate, ReservationUpdate, ReservationOut,
    InfractionCreate, InfractionUpdate, InfractionOut,
    RegulationCreate, RegulationUpdate, RegulationOut,
)
from src.services import reservation_service, infraction_service

router = APIRouter()


# === Reservations ===

@router.get("/reservations", response_model=list[ReservationOut])
def list_reservations(
    asset_id: int | None = None,
    status_filter: str | None = None,
    resident_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from src.models.reservation import Reservation

    query = db.query(Reservation).filter(Reservation.is_active == True)
    if asset_id:
        query = query.filter(Reservation.asset_id == asset_id)
    if status_filter:
        query = query.filter(Reservation.status == status_filter)
    if resident_id:
        query = query.filter(Reservation.resident_id == resident_id)
    return query.order_by(Reservation.start_datetime.desc()).all()


@router.post("/reservations", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
def create_reservation(body: ReservationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = reservation_service.create_reservation(
        resident_id=body.resident_id,
        asset_id=body.asset_id,
        area_type=body.area_type,
        area_name=body.area_name,
        start_datetime=body.start_datetime,
        end_datetime=body.end_datetime,
        guests_count=body.guests_count,
        purpose=body.purpose,
    )
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    return result


@router.put("/reservations/{reservation_id}", response_model=ReservationOut)
def update_reservation(reservation_id: int, body: ReservationUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.reservation import Reservation

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id, Reservation.is_active == True
    ).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(reservation, key, value)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.post("/reservations/{reservation_id}/approve")
def approve_reservation(reservation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = reservation_service.approve_reservation(reservation_id, user.id)
    return result


@router.post("/reservations/{reservation_id}/reject")
def reject_reservation(reservation_id: int, body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    reason = body.get("reason", "Sin motivo especificado")
    result = reservation_service.reject_reservation(reservation_id, reason)
    return result


@router.post("/reservations/{reservation_id}/cancel")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.reservation import Reservation
    from src.models.census import CensusResident

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id, Reservation.is_active == True
    ).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")

    resident = db.query(CensusResident).filter(CensusResident.user_id == user.id).first()
    if resident and reservation.resident_id != resident.id:
        require_role(user, "consejo")

    result = reservation_service.cancel_reservation(reservation_id)
    return result


@router.get("/reservations/calendar")
def get_calendar(
    asset_id: int | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reservations = reservation_service.get_calendar(asset_id, start_date, end_date)
    return reservations


# === Infractions ===

@router.get("/infractions", response_model=list[InfractionOut])
def list_infrictions(
    resident_id: int | None = None,
    asset_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    infractions = infraction_service.list_infrictions(resident_id, asset_id, status_filter)
    return infractions


@router.post("/infractions", response_model=InfractionOut, status_code=status.HTTP_201_CREATED)
def create_infraction(body: InfractionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = infraction_service.create_infraction(
        resident_id=body.resident_id,
        asset_id=body.asset_id,
        category=body.category,
        description=body.description,
        severity=body.severity,
        fine_amount=body.fine_amount,
        issued_by=user.id,
    )
    return result


@router.put("/infractions/{infraction_id}", response_model=InfractionOut)
def update_infraction(infraction_id: int, body: InfractionUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    from src.models.reservation import Infraction

    infraction = db.query(Infraction).filter(
        Infraction.id == infraction_id, Infraction.is_active == True
    ).first()
    if not infraction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Infraccion no encontrada")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(infraction, key, value)
    db.commit()
    db.refresh(infraction)
    return infraction


@router.post("/infractions/{infraction_id}/acknowledge")
def acknowledge_infraction(infraction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = infraction_service.acknowledge_infraction(infraction_id)
    return result


@router.post("/infractions/{infraction_id}/resolve")
def resolve_infraction(infraction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "consejo")
    result = infraction_service.resolve_infraction(infraction_id)
    return result


# === Regulations ===

@router.get("/regulations", response_model=list[RegulationOut])
def list_regulations(
    chapter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    regulations = infraction_service.list_regulations(chapter)
    return regulations


@router.get("/regulations/{regulation_id}", response_model=RegulationOut)
def get_regulation(regulation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from src.models.reservation import Regulation

    regulation = db.query(Regulation).filter(
        Regulation.id == regulation_id, Regulation.is_active == True
    ).first()
    if not regulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reglamento no encontrado")
    return regulation


@router.post("/regulations", response_model=RegulationOut, status_code=status.HTTP_201_CREATED)
def create_regulation(body: RegulationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "admin")
    from src.models.reservation import Regulation

    regulation = Regulation(**body.model_dump(), updated_by=user.id)
    db.add(regulation)
    db.commit()
    db.refresh(regulation)
    return regulation


@router.put("/regulations/{regulation_id}", response_model=RegulationOut)
def update_regulation(regulation_id: int, body: RegulationUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_role(user, "admin")
    from src.models.reservation import Regulation

    regulation = db.query(Regulation).filter(
        Regulation.id == regulation_id
    ).first()
    if not regulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reglamento no encontrado")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(regulation, key, value)
    regulation.updated_by = user.id
    db.commit()
    db.refresh(regulation)
    return regulation
