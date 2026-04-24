import uuid

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class DocumentCategory(Base):
    __tablename__ = "document_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("document_categories.id"), nullable=True)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    children = relationship("DocumentCategory", backref="parent", remote_side=[id])
    documents = relationship("Document", back_populates="category")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("document_categories.id"), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    classified_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_token: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    share_expires_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("DocumentCategory", back_populates="documents")
    creator = relationship("User", back_populates="documents_created")
    metadata_entries = relationship("DocumentMetadata", back_populates="document", cascade="all, delete-orphan")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)

    document = relationship("Document", back_populates="metadata_entries")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    version_num: Mapped[int] = mapped_column(Integer, nullable=False)
    changed_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    change_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="versions")
    changer = relationship("User", back_populates="documents_changed")
