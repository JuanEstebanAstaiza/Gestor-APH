import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import Button from "./Button";

interface NavItem {
  label: string;
  icon: string;
  path: string;
  minRole: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
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

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const { toggleSidebar } = useAuthStore();
  const roleLevel = getUserRoleLevel(user?.role || "");
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

  return (
    <>
      <aside
        className="sidebar"
        style={{
          width: collapsed ? 64 : 240,
        }}
      >
        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} style={{ background: "transparent", color: "#fff", fontSize: 18, padding: "4px 8px" }}>
            {collapsed ? "▶" : "◀"}
          </Button>
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
                    className="sidebar-link"
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "8px 0" : "8px 12px",
                    }}
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
      {/* Spacer when sidebar is collapsed */}
      {collapsed && <div style={{ width: 64, flexShrink: 0 }} />}
    </>
  );
}
