from sqlalchemy import Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class ResidentAsset(Base):
    __tablename__ = "resident_assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    resident_id: Mapped[int] = mapped_column(ForeignKey("census_residents.id"))
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"))
    assigned_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_primary: Mapped[bool] = mapped_column(default=False)

    resident = relationship("CensusResident", back_populates="linked_assets")
    asset = relationship("Asset", back_populates="linked_assets")
