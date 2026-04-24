import uuid

from sqlalchemy import Boolean, DateTime, Date, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Assembly(Base):
    __tablename__ = "assemblies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    date: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    quorum_required: Mapped[int] = mapped_column(Integer, default=0)
    quorum_achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    announced_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="assemblies_created")
    agendas = relationship("Agenda", back_populates="assembly", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="assembly", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="assembly", cascade="all, delete-orphan")
    minutes_list = relationship("Minute", back_populates="assembly", cascade="all, delete-orphan")
    tasks = relationship("TaskFollowup", back_populates="assembly")


class Agenda(Base):
    __tablename__ = "agendas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assembly_id: Mapped[int] = mapped_column(Integer, ForeignKey("assemblies.id", ondelete="CASCADE"), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    presenter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assembly = relationship("Assembly", back_populates="agendas")
    presenter = relationship("User", back_populates="agendas_presented")


class Attendance(Base):
    __tablename__ = "assembly_attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assembly_id: Mapped[int] = mapped_column(Integer, ForeignKey("assemblies.id", ondelete="CASCADE"), nullable=False)
    resident_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    confirmed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assembly = relationship("Assembly", back_populates="attendance")
    resident = relationship("CensusResident", back_populates="attendance_records")


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assembly_id: Mapped[int] = mapped_column(Integer, ForeignKey("assemblies.id", ondelete="CASCADE"), nullable=False)
    agenda_item_id: Mapped[int | None] = mapped_column(ForeignKey("agendas.id", ondelete="CASCADE"), nullable=True)
    voter_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"), nullable=False)
    option: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)
    voted_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    assembly = relationship("Assembly", back_populates="votes")
    resident = relationship("CensusResident", back_populates="votes")


class Minute(Base):
    __tablename__ = "minutes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    assembly_id: Mapped[int] = mapped_column(Integer, ForeignKey("assemblies.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(String(512), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assembly = relationship("Assembly", back_populates="minutes_list")
    creator = relationship("User", back_populates="minutes_created")
    approver = relationship("User", back_populates="minutes_approved")


class TaskFollowup(Base):
    __tablename__ = "task_followups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    assembly_id: Mapped[int | None] = mapped_column(ForeignKey("assemblies.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=False)
    assigned_to: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    deadline: Mapped[str | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assignee = relationship("User", back_populates="tasks_assigned")
    assembly = relationship("Assembly", back_populates="tasks")
