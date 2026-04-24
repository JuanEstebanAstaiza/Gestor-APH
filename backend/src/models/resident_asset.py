from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class ResidentAsset(Base):
    __tablename__ = "resident_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    resident_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"))
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id"))
    assigned_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    resident = relationship("CensusResident", back_populates="assets")
    asset = relationship("Asset", back_populates="resident_assets")
