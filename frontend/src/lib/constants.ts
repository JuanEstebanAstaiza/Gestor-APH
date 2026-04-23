export const ROLES = {
  ADMIN: "admin",
  CONSEJO: "consejo",
  VIGILANCIA: "vigilancia",
  RESIDENTE: "residente",
} as const;

export const PROPERTY_TYPES = {
  OWNER: "owner",
  TENANT: "tenant",
  OCCUPANT: "occupant",
} as const;

export const ASSET_TYPES = {
  APARTMENT: "apartment",
  PARKING: "parking",
  STORAGE: "storage",
  COMMERCIAL: "commercial",
} as const;

export const VISITOR_STATUSES = {
  APPROVED: "approved",
  PENDING: "pending",
  REVOKED: "revoked",
  COMPLETED: "completed",
} as const;

export const AUTH_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  consejo: "Consejo",
  vigilancia: "Vigilancia",
  residente: "Residente",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  owner: "Propietario",
  tenant: "Arrendatario",
  occupant: "Ocupante",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  parking: "Parqueadero",
  storage: "Depósito",
  commercial: "Comercial",
};

export const PROVIDER_TYPE_LABELS: Record<string, string> = {
  empresa: "Empresa",
  independiente: "Independiente",
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  expired: "Vencido",
  terminated: "Terminado",
  pending: "Pendiente",
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  maintenance: "Mantenimiento",
  contract_expiry: "Vencimiento contrato",
  warranty_expiry: "Vencimiento garantía",
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  notified: "Notificado",
  completed: "Completado",
  dismissed: "Descartado",
};
