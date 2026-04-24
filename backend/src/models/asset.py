from sqlalchemy import Boolean, DateTime, Numeric, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_type: Mapped[str] = mapped_column(
        Enum("apartment", "parking", "storage", "commercial"), nullable=False
    )
    unit_number: Mapped[str] = mapped_column(String(50), nullable=False)
    floor: Mapped[int | None] = mapped_column(nullable=True)
    area_sqm: Mapped[str | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    linked_assets = relationship("ResidentAsset", back_populates="asset", cascade="all, delete-orphan")
    resident_assets = relationship("ResidentAsset", back_populates="resident")
    reservations = relationship("Reservation", back_populates="asset")
    infractions = relationship("Infraction", back_populates="asset")
    maintenance_alerts = relationship("MaintenanceAlert", back_populates="asset")
