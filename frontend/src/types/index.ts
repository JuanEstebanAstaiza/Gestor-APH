export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  status: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface CensusResident {
  id: number;
  user_id: number | null;
  property_type: string;
  move_in_date: string | null;
  move_out_date: string | null;
  lease_end: string | null;
  is_active: boolean;
}

export interface Asset {
  id: number;
  asset_type: string;
  unit_number: string;
  floor: number | null;
  area_sqm: string | null;
  is_active: boolean;
}

export interface Document {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category_id: number | null;
  source_type: string | null;
  classified_by: string | null;
  is_public: boolean;
  share_token: string | null;
  share_expires_at: string | null;
  created_by: number;
}

export interface Visitor {
  id: number;
  first_name: string;
  last_name: string;
  id_document: string;
  vehicle_plate: string | null;
  resident_id: number | null;
  status: string;
  authorized_by: number | null;
  entry_time: string | null;
  exit_time: string | null;
  notes: string | null;
}

export interface Authorization {
  id: number;
  requester_id: number;
  target_type: string;
  target_desc: string;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  expiry_date: string | null;
  notes: string | null;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
}

// Finance types (Fase 11)
export interface Account {
  id: number;
  name: string;
  bank_name: string | null;
  account_number: string | null;
  account_type: string | null;
  description: string | null;
  is_active: boolean;
}

export interface AccountCreate {
  name: string;
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  description?: string;
}

export interface Invoice {
  id: number;
  uuid: string;
  resident_id: number;
  asset_id: number;
  period: string;
  amount: string;
  status: string;
  due_date: string;
  sent_at: string | null;
  paid_at: string | null;
  generated_by: number | null;
}

export interface InvoiceCreate {
  resident_id: number;
  asset_id: number;
  period: string;
  amount: string;
  due_date: string;
}

export interface Payment {
  id: number;
  uuid: string;
  invoice_id: number;
  amount: string;
  payment_method: string | null;
  reference_number: string | null;
  payment_date: string;
  processed_by: number | null;
  status: string;
  notes: string | null;
}

export interface PaymentCreate {
  invoice_id: number;
  amount: string;
  payment_method?: string;
  reference_number?: string;
  payment_date: string;
  notes?: string;
}

export interface Balance {
  resident_id: number;
  total_due: string;
  total_paid: string;
  balance: string;
  months_overdue: number;
}

export interface PazYSalvo {
  resident_id: number;
  is_current: boolean;
  total_balance: string;
  months_overdue: number;
  generated_at: string;
}

export interface FinancialReport {
  invoices: Invoice[];
  payments: Payment[];
}

// Communication types (Fase 12)
export interface PQRS {
  id: number;
  uuid: string;
  requester_id: number;
  type: string;
  category: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: number | null;
  resolved_at: string | null;
  response: string | null;
  is_active: boolean;
}

export interface PQRSCreate {
  requester_id: number;
  type: string;
  category?: string;
  subject: string;
  description: string;
  priority?: string;
}

export interface FAQEntry {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  keywords: string[] | null;
  is_active: boolean;
}

export interface FAQSearchResponse {
  data: FAQEntry[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface FAQCreate {
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}

export interface Circular {
  id: number;
  uuid: string;
  title: string;
  content: string;
  target_type: string | null;
  target_value: string | null;
  status: string;
  sent_at: string | null;
  sent_by: number | null;
}

export interface CircularCreate {
  title: string;
  content: string;
  target_type?: string;
  target_value?: string;
  status?: string;
}

export interface Communication {
  id: number;
  sender_id: number;
  recipient_id: number;
  type: string;
  subject: string | null;
  content: string;
  status: string;
  sent_at: string | null;
}

// Modulo G: Reservas y Convivencia (Fase 13)
export interface Reservation {
  id: number;
  uuid: string;
  resident_id: number;
  asset_id: number;
  area_type: string;
  area_name: string;
  start_datetime: string;
  end_datetime: string;
  guests_count: number;
  purpose: string | null;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  balance_check: boolean;
  is_active: boolean;
}

export interface ReservationCreate {
  resident_id: number;
  asset_id: number;
  area_type: string;
  area_name: string;
  start_datetime: string;
  end_datetime: string;
  guests_count?: number;
  purpose?: string;
}

export interface Infraction {
  id: number;
  uuid: string;
  resident_id: number;
  asset_id: number;
  category: string;
  description: string;
  severity: string;
  warning_count: number;
  fine_amount: string | null;
  status: string;
  issued_by: number;
  acknowledged_at: string | null;
  resolved_at: string | null;
  is_active: boolean;
}

export interface InfractionCreate {
  resident_id: number;
  asset_id: number;
  category: string;
  description: string;
  severity: string;
  fine_amount?: string;
}

export interface Regulation {
  id: number;
  title: string;
  content: string;
  section_number: string | null;
  chapter: string | null;
  order: number | null;
  is_active: boolean;
}

export interface RegulationCreate {
  title: string;
  content: string;
  section_number?: string;
  chapter?: string;
  order?: number;
}

// Modulo F: Asambleas y Consejo (Fase 14)
export interface Assembly {
  id: number;
  uuid: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  status: string;
  quorum_required: number;
  quorum_achieved: boolean;
  announced_at: string | null;
  created_by: number;
  is_active: boolean;
}

export interface AssemblyCreate {
  type: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  quorum_required?: number;
}

export interface Agenda {
  id: number;
  assembly_id: number;
  topic: string;
  description: string | null;
  presenter_id: number | null;
  order: number;
  duration_minutes: number | null;
  is_active: boolean;
}

export interface AgendaCreate {
  assembly_id: number;
  topic: string;
  description?: string;
  presenter_id?: number;
  order: number;
  duration_minutes?: number;
}

export interface Attendance {
  id: number;
  assembly_id: number;
  resident_id: number;
  status: string;
  confirmed_at: string | null;
}

export interface AttendanceCreate {
  assembly_id: number;
  resident_id: number;
  status?: string;
}

export interface Vote {
  id: number;
  assembly_id: number;
  agenda_item_id: number | null;
  voter_id: number;
  option: string;
  notes: string | null;
  voted_at: string;
}

export interface VoteCreate {
  assembly_id: number;
  agenda_item_id?: number;
  option: string;
  notes?: string;
}

export interface VoteSummary {
  agenda_item_id: number | null;
  topic: string | null;
  favor: number;
  en_contra: number;
  abstencion: number;
  total: number;
}

export interface Minute {
  id: number;
  uuid: string;
  assembly_id: number;
  title: string;
  content: string;
  file_path: string | null;
  approved_by: number | null;
  approved_at: string | null;
  version: number;
  is_active: boolean;
}

export interface MinuteCreate {
  assembly_id: number;
  title: string;
  content: string;
  file_path?: string;
}

export interface TaskFollowup {
  id: number;
  uuid: string;
  assembly_id: number | null;
  title: string;
  description: string;
  assigned_to: number;
  deadline: string | null;
  status: string;
  completed_at: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface TaskCreate {
  assembly_id?: number;
  title: string;
  description: string;
  assigned_to: number;
  deadline?: string;
}

// Modulo D: Directorio de Proveedores (Fase 15)
export interface Provider {
  id: number;
  uuid: string;
  name: string;
  type: string;
  specialty: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: number | null;
}

export interface ProviderCreate {
  name: string;
  type: string;
  specialty?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface ProviderUpdate {
  name?: string;
  type?: string;
  specialty?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  is_active?: boolean;
}

export interface Contract {
  id: number;
  provider_id: number;
  contract_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  value: string | null;
  status: string;
  renewal_notice_days: number;
  is_active: boolean;
  created_by: number | null;
}

export interface ContractCreate {
  provider_id: number;
  contract_name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  value?: string;
  status?: string;
  renewal_notice_days?: number;
}

export interface ContractUpdate {
  contract_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  value?: string;
  status?: string;
  renewal_notice_days?: number;
  is_active?: boolean;
}

export interface MaintenanceAlert {
  id: number;
  uuid: string;
  asset_id: number;
  provider_id: number | null;
  alert_type: string;
  description: string;
  scheduled_date: string;
  status: string;
  notified_at: string | null;
  completed_at: string | null;
  notified_to: number | null;
  notes: string | null;
  is_active: boolean;
}

export interface AlertCreate {
  asset_id: number;
  alert_type: string;
  description: string;
  scheduled_date: string;
  provider_id?: number;
  notes?: string;
}

export interface AlertUpdate {
  status?: string;
  description?: string;
  scheduled_date?: string;
  notes?: string;
}

export interface AlertSummary {
  asset_id: number;
  asset_unit_number: string;
  asset_type: string;
  pending_count: number;
  overdue_count: number;
  upcoming_count: number;
}

export interface AlertDashboardSummary {
  alerts: MaintenanceAlert[];
  summary: AlertSummary[];
  total_pending: number;
  total_overdue: number;
  total_completed: number;
}
