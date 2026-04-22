import uuid

from sqlalchemy import Boolean, DateTime, Decimal, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    resident_id: Mapped[int] = mapped_column(ForeignKey("census_residents.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    area_type: Mapped[str] = mapped_column(String(50), nullable=False)
    area_name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_datetime: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    end_datetime: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    guests_count: Mapped[int] = mapped_column(default=0)
    purpose: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)
    balance_check: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resident = relationship("CensusResident")
    asset = relationship("Asset")


class Infraction(Base):
    __tablename__ = "infractions"

    id: Mapped[int] = mapped_column(primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    resident_id: Mapped[int] = mapped_column(ForeignKey("census_residents.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    warning_count: Mapped[int] = mapped_column(default=0)
    fine_amount: Mapped[str | None] = mapped_column(Decimal(12, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    issued_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    acknowledged_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resident = relationship("CensusResident")
    asset = relationship("Asset")


class Regulation(Base):
    __tablename__ = "regulations"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(String(512), nullable=False)
    section_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    chapter: Mapped[str | None] = mapped_column(String(100), nullable=True)
    order: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    updated_by_user = relationship("User")
