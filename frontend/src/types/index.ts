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
