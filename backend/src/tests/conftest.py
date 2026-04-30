import uuid as uuid_lib

import pytest
import bcrypt
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from src.main import app
from src.config import settings
from src.core.security import create_access_token, create_refresh_token, hash_password
from src.models.user import User
from src.models.refresh_token import RefreshToken


# Replace JWT secret for testing
TEST_JWT_SECRET = "test-secret-key-for-testing-purposes-only-do-not-use-in-production"
TEST_ACCESS_EXPIRE = 60  # minutes
TEST_REFRESH_EXPIRE = 7  # days

_original_jwt_secret = settings.jwt_secret_key
_original_access_expire = settings.access_token_expire_minutes
_original_refresh_expire = settings.refresh_token_expire_days


@pytest.fixture(autouse=True)
def patch_settings():
    settings.jwt_secret_key = TEST_JWT_SECRET
    settings.access_token_expire_minutes = TEST_ACCESS_EXPIRE
    settings.refresh_token_expire_days = TEST_REFRESH_EXPIRE
    yield
    settings.jwt_secret_key = _original_jwt_secret
    settings.access_token_expire_minutes = _original_access_expire
    settings.refresh_token_expire_days = _original_refresh_expire


# SQLite engine for testing
import os
import tempfile

_TEST_DB_PATH = os.path.join(tempfile.gettempdir(), "test_aph.db")

engine = create_engine(
    f"sqlite:///{_TEST_DB_PATH}",
    connect_args={"check_same_thread": False},
)


def _create_test_db():
    """Create all tables using raw SQL compatible with SQLite."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                phone TEXT,
                role TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                last_login TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                token_hash TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                revoked BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS document_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                parent_id INTEGER REFERENCES document_categories(id),
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_type TEXT NOT NULL,
                unit_number TEXT NOT NULL,
                floor INTEGER,
                area_sqm TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS census_residents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE REFERENCES users(id),
                property_type TEXT NOT NULL,
                move_in_date TEXT,
                move_out_date TEXT,
                lease_end TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS resident_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                assigned_at TEXT DEFAULT (datetime('now')),
                is_primary BOOLEAN DEFAULT 0
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS resident_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                uploaded_by INTEGER NOT NULL REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                id_document TEXT NOT NULL,
                vehicle_plate TEXT,
                resident_id INTEGER REFERENCES census_residents(id),
                status TEXT DEFAULT 'pending',
                authorized_by INTEGER REFERENCES users(id),
                entry_time TEXT,
                exit_time TEXT,
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS authorizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL REFERENCES census_residents(id),
                target_type TEXT NOT NULL,
                target_desc TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                approved_by INTEGER REFERENCES users(id),
                approved_at TEXT,
                expiry_date TEXT,
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                file_path TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                category_id INTEGER REFERENCES document_categories(id),
                source_type TEXT,
                source_ref TEXT,
                classified_by TEXT,
                is_public BOOLEAN DEFAULT 0,
                share_token TEXT UNIQUE,
                share_expires_at TEXT,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS document_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                key TEXT NOT NULL,
                value TEXT NOT NULL
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS document_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                file_path TEXT NOT NULL,
                version_num INTEGER NOT NULL,
                changed_by INTEGER NOT NULL REFERENCES users(id),
                change_note TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id),
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER,
                details TEXT,
                ip_address TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                bank_name TEXT,
                account_number TEXT,
                account_type TEXT,
                description TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                period TEXT NOT NULL,
                amount TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                due_date TEXT NOT NULL,
                sent_at TEXT,
                paid_at TEXT,
                generated_by INTEGER REFERENCES users(id),
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                invoice_id INTEGER NOT NULL REFERENCES invoices(id),
                amount TEXT NOT NULL,
                payment_method TEXT,
                reference_number TEXT,
                payment_date TEXT NOT NULL,
                processed_by INTEGER REFERENCES users(id),
                status TEXT DEFAULT 'pending',
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS balance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                period TEXT NOT NULL,
                total_due TEXT NOT NULL,
                total_paid TEXT NOT NULL,
                balance TEXT NOT NULL,
                months_overdue INTEGER DEFAULT 0,
                generated_at TEXT DEFAULT (datetime('now')),
                is_active BOOLEAN DEFAULT 1
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pqrs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                requester_id INTEGER NOT NULL REFERENCES census_residents(id),
                type TEXT NOT NULL,
                category TEXT,
                subject TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                priority TEXT DEFAULT 'normal',
                assigned_to INTEGER REFERENCES users(id),
                resolved_at TEXT,
                response TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pqrs_attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pqrs_id INTEGER NOT NULL REFERENCES pqrs(id) ON DELETE CASCADE,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT,
                uploaded_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS faq_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                category TEXT,
                keywords TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS circulars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                target_type TEXT,
                target_value TEXT,
                status TEXT DEFAULT 'draft',
                sent_at TEXT,
                sent_by INTEGER REFERENCES users(id),
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS communications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL REFERENCES users(id),
                recipient_id INTEGER NOT NULL REFERENCES census_residents(id),
                type TEXT NOT NULL,
                subject TEXT,
                content TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                sent_at TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                area_type TEXT NOT NULL,
                area_name TEXT NOT NULL,
                start_datetime TEXT NOT NULL,
                end_datetime TEXT NOT NULL,
                guests_count INTEGER DEFAULT 0,
                purpose TEXT,
                status TEXT DEFAULT 'pending',
                approved_by INTEGER REFERENCES users(id),
                approved_at TEXT,
                rejection_reason TEXT,
                balance_check BOOLEAN DEFAULT 1,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS infractions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                severity TEXT NOT NULL,
                warning_count INTEGER DEFAULT 0,
                fine_amount TEXT,
                status TEXT DEFAULT 'open',
                issued_by INTEGER NOT NULL REFERENCES users(id),
                acknowledged_at TEXT,
                resolved_at TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS regulations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                section_number TEXT,
                chapter TEXT,
                "order" INTEGER,
                is_active BOOLEAN DEFAULT 1,
                updated_by INTEGER REFERENCES users(id),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS assemblies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                location TEXT,
                status TEXT DEFAULT 'draft',
                quorum_required INTEGER DEFAULT 0,
                quorum_achieved BOOLEAN DEFAULT 0,
                announced_at TEXT,
                created_by INTEGER NOT NULL REFERENCES users(id),
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
                topic TEXT NOT NULL,
                description TEXT,
                presenter INTEGER REFERENCES users(id),
                "order" INTEGER NOT NULL,
                duration_minutes INTEGER,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS assembly_attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
                resident_id INTEGER NOT NULL REFERENCES census_residents(id),
                status TEXT DEFAULT 'pending',
                confirmed_at TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
                agenda_item_id INTEGER REFERENCES agendas(id) ON DELETE CASCADE,
                voter_id INTEGER NOT NULL REFERENCES census_residents(id),
                option TEXT NOT NULL,
                notes TEXT,
                voted_at TEXT DEFAULT (datetime('now')),
                is_active BOOLEAN DEFAULT 1
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS minutes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                assembly_id INTEGER NOT NULL REFERENCES assemblies(id),
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                file_path TEXT,
                approved_by INTEGER REFERENCES users(id),
                approved_at TEXT,
                version INTEGER DEFAULT 1,
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS task_followups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                assembly_id INTEGER REFERENCES assemblies(id),
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                assigned_to INTEGER NOT NULL REFERENCES users(id),
                deadline TEXT,
                status TEXT DEFAULT 'open',
                completed_at TEXT,
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                specialty TEXT,
                contact_name TEXT,
                phone TEXT,
                email TEXT,
                address TEXT,
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS provider_contracts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider_id INTEGER NOT NULL REFERENCES providers(id),
                contract_name TEXT NOT NULL,
                description TEXT,
                start_date TEXT NOT NULL,
                end_date TEXT,
                value TEXT,
                status TEXT DEFAULT 'active',
                renewal_notice_days INTEGER DEFAULT 30,
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS maintenance_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                asset_id INTEGER NOT NULL REFERENCES assets(id),
                provider_id INTEGER REFERENCES providers(id),
                alert_type TEXT NOT NULL,
                description TEXT NOT NULL,
                scheduled_date TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                notified_at TEXT,
                completed_at TEXT,
                notified_to INTEGER REFERENCES users(id),
                notes TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.commit()

        # Seed document categories
        conn.execute(text("""
            INSERT OR IGNORE INTO document_categories (name, description) VALUES
            ('Actas', 'Actas de asamblea y consejo'),
            ('Reglamentos', 'Reglamento de propiedad horizontal'),
            ('Financiero', 'Estados financieros, facturas'),
            ('Tecnico', 'Informes técnicos, mantenimiento'),
            ('Legal', 'Documentos legales, contratos'),
            ('Comunicacion', 'Circulares, avisos'),
            ('Censo', 'Documentos de residentes')
        """))
        conn.commit()


_create_test_db()


@pytest.fixture
def db_session():
    """Provide a database session with fresh state for each test."""
    session = Session(engine)
    yield session
    # Clean up: delete all data but keep tables
    tables = [
        "maintenance_alerts", "provider_contracts", "providers",
        "task_followups", "minutes", "votes", "assembly_attendance",
        "agendas", "assemblies", "regulations", "infractions",
        "reservations", "communications", "circulars", "faq_entries",
        "pqrs_attachments", "pqrs", "balance_records", "payments",
        "invoices", "accounts", "activity_log", "document_versions",
        "document_metadata", "documents", "authorizations", "visitors",
        "resident_files", "resident_assets", "census_residents",
        "assets", "document_categories", "refresh_tokens", "users",
    ]
    for table in tables:
        session.execute(text(f"DELETE FROM {table}"))
    session.commit()
    session.close()


def _create_test_user(db: Session, role: str = "admin", status: str = "active") -> User:
    """Create a test user and return it as a SQLAlchemy model."""
    user_uuid = uuid_lib.uuid4()
    user = User(
        id=1,
        uuid=user_uuid,
        email=f"test-{role}@test.com",
        password_hash=hash_password("testpassword123"),
        full_name=f"Test {role}",
        phone="123456789",
        role=role,
        status=status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_test_refresh_token(db: Session, user: User) -> RefreshToken:
    """Create a test refresh token and return it as a SQLAlchemy model."""
    token_hash = hash_password(f"refresh-{user.uuid}")
    rt = RefreshToken(
        id=str(uuid_lib.uuid4()),
        user_id=user.id,
        token_hash=token_hash,
        expires_at="2099-12-31T23:59:59+00:00",
        revoked=False,
        is_active=True,
    )
    db.add(rt)
    db.commit()
    db.refresh(rt)
    return rt


@pytest.fixture
def admin_user(db_session) -> User:
    return _create_test_user(db_session, role="admin")


@pytest.fixture
def consejo_user(db_session) -> User:
    return _create_test_user(db_session, role="consejo")


@pytest.fixture
def vigilancia_user(db_session) -> User:
    return _create_test_user(db_session, role="vigilancia")


@pytest.fixture
def residente_user(db_session) -> User:
    return _create_test_user(db_session, role="residente")


@pytest.fixture
def suspended_user(db_session) -> User:
    return _create_test_user(db_session, role="residente", status="suspended")


@pytest.fixture
def pending_user(db_session) -> User:
    return _create_test_user(db_session, role="residente", status="pending")


@pytest.fixture
def admin_token() -> str:
    user_uuid = uuid_lib.uuid4()
    return create_access_token(str(user_uuid), "admin")


@pytest.fixture
def residente_token() -> str:
    user_uuid = uuid_lib.uuid4()
    return create_access_token(str(user_uuid), "residente")


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def residente_headers(residente_token):
    return {"Authorization": f"Bearer {residente_token}"}


@pytest.fixture
def client(db_session):
    """Provide a TestClient pointing to the app with test DB."""
    # Override get_db to use test DB
    def _override_get_db():
        session = Session(engine)
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def async_client(db_session):
    """Provide an async TestClient."""
    def _override_get_db():
        session = Session(engine)
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def test_resident(db_session) -> User:
    """Create a resident user with a linked census record and asset."""
    user = _create_test_user(db_session, role="residente")
    asset_id = 1
    # Create a test asset
    from src.models.asset import Asset
    asset = Asset(id=asset_id, asset_type="apartment", unit_number="101", floor=1, area_sqm="85.00")
    db_session.add(asset)
    db_session.commit()
    # Create census record linked to user
    from src.models.census import CensusResident
    resident = CensusResident(
        id=1,
        user_id=user.id,
        property_type="owner",
        move_in_date="2024-01-01",
    )
    db_session.add(resident)
    db_session.commit()
    return user
