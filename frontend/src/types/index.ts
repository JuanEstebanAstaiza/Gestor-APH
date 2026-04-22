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
