"""initial schema

Revision ID: 001
Revises: none
Create Date: 2026-04-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    sa.Enum("admin", "consejo", "vigilancia", "residente", name="user_role").create(op.get_bind())
    sa.Enum("active", "suspended", "pending", name="user_status").create(op.get_bind())
    sa.Enum("approved", "pending", "revoked", "completed", name="visitor_status").create(op.get_bind())
    sa.Enum("pending", "approved", "rejected", "expired", name="auth_status").create(op.get_bind())
    sa.Enum("owner", "tenant", "occupant", name="census_type").create(op.get_bind())
    sa.Enum("apartment", "parking", "storage", "commercial", name="asset_type").create(op.get_bind())

    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", postgresql.UUID(as_uuid=True), unique=True, nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(512), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("role", sa.Enum("admin", "consejo", "vigilancia", "residente", name="user_role"), nullable=False),
        sa.Column("status", sa.Enum("active", "suspended", "pending", name="user_status"), nullable=False, server_default="active"),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Refresh tokens
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(512), unique=True, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), server_default="false"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Document categories
    op.create_table(
        "document_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("document_categories.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Assets
    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("asset_type", sa.Enum("apartment", "parking", "storage", "commercial", name="asset_type"), nullable=False),
        sa.Column("unit_number", sa.String(50), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=True),
        sa.Column("area_sqm", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Census residents
    op.create_table(
        "census_residents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True, nullable=True),
        sa.Column("property_type", sa.Enum("owner", "tenant", "occupant", name="census_type"), nullable=False),
        sa.Column("move_in_date", sa.Date(), nullable=True),
        sa.Column("move_out_date", sa.Date(), nullable=True),
        sa.Column("lease_end", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Resident assets link
    op.create_table(
        "resident_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("resident_id", sa.Integer(), sa.ForeignKey("census_residents.id"), nullable=False),
        sa.Column("asset_id", sa.Integer(), sa.ForeignKey("assets.id"), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("is_primary", sa.Boolean(), server_default="false"),
    )

    # Resident files
    op.create_table(
        "resident_files",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("resident_id", sa.Integer(), sa.ForeignKey("census_residents.id"), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=True),
        sa.Column("file_size", sa.BigInteger(), nullable=True),
        sa.Column("uploaded_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Visitors
    op.create_table(
        "visitors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("id_document", sa.String(100), nullable=False),
        sa.Column("vehicle_plate", sa.String(20), nullable=True),
        sa.Column("resident_id", sa.Integer(), sa.ForeignKey("census_residents.id"), nullable=True),
        sa.Column("status", sa.Enum("approved", "pending", "revoked", "completed", name="visitor_status"), server_default="pending"),
        sa.Column("authorized_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("entry_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("exit_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Authorizations
    op.create_table(
        "authorizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("requester_id", sa.Integer(), sa.ForeignKey("census_residents.id"), nullable=False),
        sa.Column("target_type", sa.String(50), nullable=False),
        sa.Column("target_desc", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("pending", "approved", "rejected", "expired", name="auth_status"), server_default="pending"),
        sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expiry_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Documents
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", postgresql.UUID(as_uuid=True), unique=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=True),
        sa.Column("file_size", sa.BigInteger(), nullable=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("document_categories.id"), nullable=True),
        sa.Column("source_type", sa.String(50), nullable=True),
        sa.Column("source_ref", sa.String(255), nullable=True),
        sa.Column("classified_by", sa.String(50), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default="false"),
        sa.Column("share_token", sa.String(64), unique=True, nullable=True),
        sa.Column("share_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Document metadata
    op.create_table(
        "document_metadata",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
    )

    # Document versions
    op.create_table(
        "document_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("version_num", sa.Integer(), nullable=False),
        sa.Column("changed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("change_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Activity log
    op.create_table(
        "activity_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("details", postgresql.JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Seed document categories
    op.execute(
        """
        INSERT INTO document_categories (name, description) VALUES
        ('Actas', 'Actas de asamblea y consejo'),
        ('Renglamentos', 'Reglamento de propiedad horizontal'),
        ('Financiero', 'Estados financieros, facturas'),
        ('Tecnico', 'Informes técnicos, mantenimiento'),
        ('Legal', 'Documentos legales, contratos'),
        ('Comunicacion', 'Circulares, avisos'),
        ('Censo', 'Documentos de residentes')
        """
    )


def downgrade() -> None:
    op.drop_table("activity_log")
    op.drop_table("document_versions")
    op.drop_table("document_metadata")
    op.drop_table("documents")
    op.drop_table("authorizations")
    op.drop_table("visitors")
    op.drop_table("resident_files")
    op.drop_table("resident_assets")
    op.drop_table("census_residents")
    op.drop_table("assets")
    op.drop_table("document_categories")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
    op.drop_type("user_role")
    op.drop_type("user_status")
    op.drop_type("visitor_status")
    op.drop_type("auth_status")
    op.drop_type("census_type")
    op.drop_type("asset_type")
