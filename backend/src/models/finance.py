import uuid

from sqlalchemy import Boolean, DateTime, Date, Numeric, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    invoices = relationship("Invoice", back_populates="account")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    resident_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id"), nullable=False)
    period: Mapped[str] = mapped_column(String(7), nullable=False)  # YYYY-MM
    amount: Mapped[str] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(Enum("pending", "sent", "paid", "overdue", "cancelled"), default="pending")
    due_date: Mapped[str] = mapped_column(Date, nullable=False)
    sent_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    generated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resident = relationship("CensusResident", back_populates="resident_invoices")
    asset = relationship("Asset", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    invoice_id: Mapped[int] = mapped_column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount: Mapped[str] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payment_date: Mapped[str] = mapped_column(Date, nullable=False)
    processed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(Enum("pending", "verified", "rejected"), default="pending")
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    invoice = relationship("Invoice", back_populates="payments")


class BalanceRecord(Base):
    __tablename__ = "balance_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    resident_id: Mapped[int] = mapped_column(Integer, ForeignKey("census_residents.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id"), nullable=False)
    period: Mapped[str] = mapped_column(String(7), nullable=False)
    total_due: Mapped[str] = mapped_column(Numeric(12, 2), nullable=False)
    total_paid: Mapped[str] = mapped_column(Numeric(12, 2), nullable=False)
    balance: Mapped[str] = mapped_column(Numeric(12, 2), nullable=False)
    months_overdue: Mapped[int] = mapped_column(Integer, default=0)
    generated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
