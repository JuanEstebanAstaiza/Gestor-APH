from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class PQRS(Base):
    __tablename__ = "pqrs"

    id: Mapped[int] = mapped_column(primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=__import__("uuid").uuid4)
    requester_id: Mapped[int] = mapped_column(ForeignKey("census_residents.id"), nullable=False)
    type: Mapped[str] = mapped_column(Enum("peticion", "queja", "reclamo", "sugerencia"), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Enum("open", "in_progress", "resolved", "closed", "dismissed"), default="open")
    priority: Mapped[str] = mapped_column(Enum("low", "normal", "high", "urgent"), default="normal")
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    response: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requester = relationship("CensusResident")
    assignee = relationship("User")
    attachments = relationship("PQRSAttachment", back_populates="pqrs", cascade="all, delete-orphan")


class PQRSAttachment(Base):
    __tablename__ = "pqrs_attachments"

    id: Mapped[int] = mapped_column(primary_key=True)
    pqrs_id: Mapped[int] = mapped_column(ForeignKey("pqrs.id", ondelete="CASCADE"))
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    uploaded_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    pqrs = relationship("PQRS", back_populates="attachments")


class FAQEntry(Base):
    __tablename__ = "faq_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    question: Mapped[str] = mapped_column(String(500), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    keywords: Mapped[list[str] | None] = mapped_column(Text(), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User")


class Circular(Base):
    __tablename__ = "circulars"

    id: Mapped[int] = mapped_column(primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=__import__("uuid").uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    target_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    sent_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sender = relationship("User")


class Communication(Base):
    __tablename__ = "communications"

    id: Mapped[int] = mapped_column(primary_key=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("census_residents.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    sent_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User")
