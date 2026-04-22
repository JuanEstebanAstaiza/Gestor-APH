-- Schema inicial — Gestor APH
-- NO usar alembic. Aplicar directamente:
-- docker exec -i gestoraph-postgres-1 psql -U postgres -d gestor_aph < backend/init_schema.sql

-- Enums
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'consejo', 'vigilancia', 'residente');
CREATE TYPE IF NOT EXISTS user_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE IF NOT EXISTS visitor_status AS ENUM ('approved', 'pending', 'revoked', 'completed');
CREATE TYPE IF NOT EXISTS auth_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE IF NOT EXISTS census_type AS ENUM ('owner', 'tenant', 'occupant');
CREATE TYPE IF NOT EXISTS asset_type AS ENUM ('apartment', 'parking', 'storage', 'commercial');

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document categories
CREATE TABLE IF NOT EXISTS document_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES document_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO document_categories (name, description) VALUES
('Actas', 'Actas de asamblea y consejo'),
('Reglamentos', 'Reglamento de propiedad horizontal'),
('Financiero', 'Estados financieros, facturas'),
('Tecnico', 'Informes técnicos, mantenimiento'),
('Legal', 'Documentos legales, contratos'),
('Comunicacion', 'Circulares, avisos'),
('Censo', 'Documentos de residentes')
ON CONFLICT (name) DO NOTHING;

-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_type asset_type NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    floor INTEGER,
    area_sqm NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Census residents
CREATE TABLE IF NOT EXISTS census_residents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    property_type census_type NOT NULL,
    move_in_date DATE,
    move_out_date DATE,
    lease_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resident assets link
CREATE TABLE IF NOT EXISTS resident_assets (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE
);

-- Resident files
CREATE TABLE IF NOT EXISTS resident_files (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_document VARCHAR(100) NOT NULL,
    vehicle_plate VARCHAR(20),
    resident_id INTEGER REFERENCES census_residents(id),
    status visitor_status DEFAULT 'pending',
    authorized_by INTEGER REFERENCES users(id),
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authorizations
CREATE TABLE IF NOT EXISTS authorizations (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES census_residents(id),
    target_type VARCHAR(50) NOT NULL,
    target_desc TEXT NOT NULL,
    status auth_status DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    category_id INTEGER REFERENCES document_categories(id),
    source_type VARCHAR(50),
    source_ref VARCHAR(255),
    classified_by VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(64) UNIQUE,
    share_expires_at TIMESTAMPTZ,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document metadata
CREATE TABLE IF NOT EXISTS document_metadata (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL
);

-- Document versions
CREATE TABLE IF NOT EXISTS document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    version_num INTEGER NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    change_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Modulo A: Gestion Financiera (Fase 11)
-- =============================================

-- Enum para status de facturas
CREATE TYPE IF NOT EXISTS invoice_status AS ENUM ('pending', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Cuentas bancarias
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    account_type VARCHAR(50),  -- savings, checking, other
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas / Cuentas de cobro
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    period VARCHAR(7) NOT NULL,  -- YYYY-MM
    amount NUMERIC(12,2) NOT NULL,
    status invoice_status DEFAULT 'pending',
    due_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    generated_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50),  -- bank_transfer, cash, check, other
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL,
    processed_by INTEGER REFERENCES users(id),
    status payment_status DEFAULT 'pending',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registros de balance (computados on-demand, no materializados)
CREATE TABLE IF NOT EXISTS balance_records (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    period VARCHAR(7) NOT NULL,  -- YYYY-MM
    total_due NUMERIC(12,2) NOT NULL,
    total_paid NUMERIC(12,2) NOT NULL,
    balance NUMERIC(12,2) NOT NULL,
    months_overdue INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- Modulo C: Atencion y Comunicacion (Fase 12)
-- =============================================

-- Enum para tipo PQRS
CREATE TYPE IF NOT EXISTS pqrs_type AS ENUM ('peticion', 'queja', 'reclamo', 'sugerencia');
CREATE TYPE IF NOT EXISTS pqrs_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'dismissed');
CREATE TYPE IF NOT EXISTS pqrs_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- PQRS
CREATE TABLE IF NOT EXISTS pqrs (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    requester_id INTEGER NOT NULL REFERENCES census_residents(id),
    type pqrs_type NOT NULL,
    category VARCHAR(50),  -- financiero, convivencia, tecnico, seguridad, otros
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status pqrs_status DEFAULT 'open',
    priority pqrs_priority DEFAULT 'normal',
    assigned_to INTEGER REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    response TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adjuntos PQRS
CREATE TABLE IF NOT EXISTS pqrs_attachments (
    id SERIAL PRIMARY KEY,
    pqrs_id INTEGER NOT NULL REFERENCES pqrs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ entries
CREATE TABLE IF NOT EXISTS faq_entries (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50),
    keywords TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circulares
CREATE TABLE IF NOT EXISTS circulars (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_type VARCHAR(50),  -- all, owners, tenants, specific_tower
    target_value TEXT,  -- JSON string for complex targeting
    status VARCHAR(20) DEFAULT 'draft',  -- draft, sent, scheduled
    sent_at TIMESTAMPTZ,
    sent_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comunicaciones
CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES census_residents(id),
    type VARCHAR(20) NOT NULL,  -- email, whatsapp, notification, circular
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, failed
    sent_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Modulo G: Reservas y Convivencia (Fase 13)
-- =============================================

-- Enum para tipo de area comun
CREATE TYPE IF NOT EXISTS area_type AS ENUM ('bbq', 'salon', 'cancha', 'piscina', 'otros');
CREATE TYPE IF NOT EXISTS reservation_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE IF NOT EXISTS infraction_category AS ENUM ('ruido', 'mascotas', 'areas_comunes', 'estacionamiento', 'otros');
CREATE TYPE IF NOT EXISTS infraction_severity AS ENUM ('minor', 'moderate', 'severe');
CREATE TYPE IF NOT EXISTS infraction_status AS ENUM ('open', 'acknowledged', 'resolved', 'escalated');

-- Reservas de areas comunes
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    area_type area_type NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    guests_count INTEGER DEFAULT 0,
    purpose TEXT,
    status reservation_status DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    balance_check BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infracciones y sanciones
CREATE TABLE IF NOT EXISTS infractions (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    category infraction_category NOT NULL,
    description TEXT NOT NULL,
    severity infraction_severity NOT NULL,
    warning_count INTEGER DEFAULT 0,
    fine_amount NUMERIC(12,2),
    status infraction_status DEFAULT 'open',
    issued_by INTEGER NOT NULL REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reglamento de propiedad horizontal
CREATE TABLE IF NOT EXISTS regulations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    section_number VARCHAR(50),
    chapter VARCHAR(100),
    "order" INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Modulo F: Asambleas y Consejo (Fase 14)
-- =============================================

-- Enums para asambleas
CREATE TYPE IF NOT EXISTS assembly_type AS ENUM ('ordinaria', 'extraordinaria', 'especial');
CREATE TYPE IF NOT EXISTS assembly_status AS ENUM ('draft', 'announced', 'in_progress', 'completed', 'cancelled');
CREATE TYPE IF NOT EXISTS attendance_status AS ENUM ('pending', 'confirmed', 'declined', 'absent');
CREATE TYPE IF NOT EXISTS vote_option AS ENUM ('favor', 'en_contra', 'abstencion');
CREATE TYPE IF NOT EXISTS task_status AS ENUM ('open', 'in_progress', 'completed', 'overdue', 'dismissed');

-- Asambleas
CREATE TABLE IF NOT EXISTS assemblies (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    type assembly_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    status assembly_status DEFAULT 'draft',
    quorum_required INTEGER DEFAULT 0,
    quorum_achieved BOOLEAN DEFAULT FALSE,
    announced_at TIMESTAMPTZ,
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendas
CREATE TABLE IF NOT EXISTS agendas (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    description TEXT,
    presenter INTEGER REFERENCES users(id),
    "order" INTEGER NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asistencia a asambleas
CREATE TABLE IF NOT EXISTS assembly_attendance (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    resident_id INTEGER NOT NULL REFERENCES census_residents(id),
    status attendance_status DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votaciones
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
    agenda_item_id INTEGER REFERENCES agendas(id) ON DELETE CASCADE,
    voter_id INTEGER NOT NULL REFERENCES census_residents(id),
    option vote_option NOT NULL,
    notes TEXT,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Actas
CREATE TABLE IF NOT EXISTS minutes (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    assembly_id INTEGER NOT NULL REFERENCES assemblies(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(500),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seguimiento de tareas
CREATE TABLE IF NOT EXISTS task_followups (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    assembly_id INTEGER REFERENCES assemblies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    deadline DATE,
    status task_status DEFAULT 'open',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
