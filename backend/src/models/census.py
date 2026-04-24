from sqlalchemy import Boolean, DateTime, Date, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class CensusResident(Base):
    __tablename__ = "census_residents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    property_type: Mapped[str] = mapped_column(
        Enum("owner", "tenant", "occupant"), nullable=False
    )
    move_in_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    move_out_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    lease_end: Mapped[str | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="census")
    assets = relationship("ResidentAsset", back_populates="resident", cascade="all, delete-orphan")
    files = relationship("ResidentFile", back_populates="resident", cascade="all, delete-orphan")
    visitors = relationship("Visitor", back_populates="resident")
    authorizations = relationship("Authorization", back_populates="requester", cascade="all, delete-orphan")
    resident_invoices = relationship("Invoice", back_populates="resident")
    reservations = relationship("Reservation", back_populates="resident")
    infractions = relationship("Infraction", back_populates="resident")
    attendance_records = relationship("Attendance", back_populates="resident")
    votes = relationship("Vote", back_populates="resident")
    resident_invoices = relationship("Invoice", back_populates="resident")
