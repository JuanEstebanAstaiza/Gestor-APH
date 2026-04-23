import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import Button from "./Button";

interface SidebarProps {
  collapsed: boolean;
}

const navGroups: Record<string, { label: string; items: { label: string; icon: string; path: string; minRole: number }[] }[]> = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", icon: "📊", path: "/", minRole: 1 },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Censo", icon: "👥", path: "/census", minRole: 1 },
      { label: "Activos", icon: "🏢", path: "/assets", minRole: 1 },
      { label: "Visitantes", icon: "🚗", path: "/visitors", minRole: 2 },
      { label: "Autorizaciones", icon: "🔑", path: "/authorizations", minRole: 1 },
    ],
  },
  {
    label: "Administracion",
    items: [
      { label: "Financiero", icon: "💰", path: "/finance", minRole: 1 },
      { label: "Comunicacion", icon: "📢", path: "/communication", minRole: 1 },
      { label: "Directorios", icon: "📋", path: "/directories", minRole: 3 },
      { label: "Documentos", icon: "📄", path: "/documents", minRole: 1 },
      { label: "Audit", icon: "🔍", path: "/audit", minRole: 3 },
    ],
  },
  {
    label: "Convivencia",
    items: [
      { label: "Reservas", icon: "📅", path: "/reservations", minRole: 1 },
      { label: "Convivencia", icon: "⚖️", path: "/convivencia", minRole: 1 },
      { label: "Asambleas", icon: "🏛️", path: "/assemblies", minRole: 3 },
      { label: "Mantenimiento", icon: "🔧", path: "/maintenance", minRole: 3 },
    ],
  },
];

function getUserRoleLevel(role: string): number {
  switch (role) {
    case "admin": return 4;
    case "consejo": return 3;
    case "vigilancia": return 2;
    case "residente": return 1;
    default: return 0;
  }
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useAuthStore();
  const roleLevel = getUserRoleLevel(user?.role || "");
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        background: "var(--color-bg-sidebar)",
        color: "#fff",
        padding: collapsed ? "16px 8px" : "16px",
        transition: "width 0.2s",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
            opacity: 0.7,
          }}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {!collapsed && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 8, padding: "0 8px" }}>Gestor APH</h2>
          <div style={{ fontSize: 12, opacity: 0.7, padding: "0 8px", marginBottom: 16 }}>
            {roleLabel}
          </div>
        </>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: collapsed ? 0 : 16 }}>
            {!collapsed && (
              <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.5, padding: "0 8px", marginBottom: 4, letterSpacing: 1 }}>
                {group.label}
              </div>
            )}
            {group.items
              .filter((item) => roleLevel >= item.minRole)
              .map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: collapsed ? "8px 0" : "8px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: collapsed ? 4 : 6,
                    fontSize: 14,
                    opacity: 0.8,
                    transition: "opacity 0.2s",
                    marginBottom: collapsed ? 4 : 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </a>
              ))}
          </div>
        ))}
      </nav>

      {/* Bottom: Profile */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
        {!collapsed ? (
          <div style={{ fontSize: 12, opacity: 0.7, padding: "0 8px" }}>
            <div style={{ marginBottom: 2 }}>{user?.full_name}</div>
            <div style={{ fontSize: 11 }}>{user?.email}</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", fontSize: 18 }}>👤</div>
        )}
      </div>
    </aside>
  );
}
