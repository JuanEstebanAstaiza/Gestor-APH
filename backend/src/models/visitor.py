from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Boolean, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    id_document: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    resident_id: Mapped[int | None] = mapped_column(ForeignKey("census_residents.id"), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("approved", "pending", "revoked", "completed"), default="pending"
    )
    authorized_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    entry_time: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    exit_time: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    authorizer = relationship("User", foreign_keys=[authorized_by])
    resident = relationship("CensusResident")
