from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Boolean, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Authorization(Base):
    __tablename__ = "authorizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requester_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"))
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_desc: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected", "expired"), default="pending"
    )
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expiry_date: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requester = relationship("CensusResident", back_populates="authorizations")
    approver = relationship("User", foreign_keys=[approved_by])
