import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth();
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
      }}
    >
      {!collapsed && <h2 style={{ fontSize: 18, marginBottom: 24, padding: "0 8px" }}>Gestor APH</h2>}
      <div style={{ fontSize: 12, opacity: 0.7, padding: "0 8px" }}>
        {collapsed ? "👤" : roleLabel}
      </div>
    </aside>
  );
}
