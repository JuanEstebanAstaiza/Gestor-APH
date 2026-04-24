import uuid

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    role: Mapped[str] = mapped_column(Enum("admin", "consejo", "vigilancia", "residente"), nullable=False)
    status: Mapped[str] = mapped_column(Enum("active", "suspended", "pending"), default="active")
    last_login: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    census = relationship("CensusResident", back_populates="user", uselist=False)
    activity_log = relationship("ActivityLog", back_populates="user")
    assemblies_created = relationship("Assembly", back_populates="creator")
    agendas_presented = relationship("Agenda", back_populates="presenter")
    minutes_created = relationship("Minute", back_populates="creator")
    minutes_approved = relationship("Minute", back_populates="approver")
    tasks_assigned = relationship("TaskFollowup", back_populates="assignee")
    documents_created = relationship("Document", back_populates="creator")
    documents_changed = relationship("DocumentVersion", back_populates="changer")
    resident_files = relationship("ResidentFile", back_populates="uploader")
    maintenance_alerts = relationship("MaintenanceAlert", back_populates="notifier")
    regulations_updated = relationship("Regulation", back_populates="updated_by_user")
    communications_sent = relationship("Communication", back_populates="sender")
    agendas_presented = relationship("Agenda", back_populates="presenter")
    maintenance_alerts = relationship("MaintenanceAlert", back_populates="notifier")
    documents_created = relationship("Document", back_populates="creator")
    documents_changed = relationship("DocumentVersion", back_populates="changer")
    resident_files = relationship("ResidentFile", back_populates="uploader")
