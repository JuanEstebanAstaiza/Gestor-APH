import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{user?.email}</span>
        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
