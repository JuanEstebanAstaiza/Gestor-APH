import os
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.models import Base
from src.models.user import User
from src.models.refresh_token import RefreshToken
from src.models.visitor import Visitor
from src.models.authorization import Authorization
from src.models.census import CensusResident
from src.models.asset import Asset
from src.models.resident_asset import ResidentAsset
from src.models.resident_file import ResidentFile
from src.models.document import DocumentCategory, Document, DocumentMetadata, DocumentVersion
from src.models.activity_log import ActivityLog

target_metadata = Base.metadata


def run_migrations_offline():
    url = context.config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        context.config.get_section(context.config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
