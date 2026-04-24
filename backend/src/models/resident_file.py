from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class ResidentFile(Base):
    __tablename__ = "resident_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    resident_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"))
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    uploaded_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resident = relationship("CensusResident", back_populates="files")
    uploader = relationship("User", back_populates="resident_files")
