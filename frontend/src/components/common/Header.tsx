import { useAuth } from "../../hooks/useAuth";
import Button from "./Button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-3) var(--space-6)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
        {user?.full_name}
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          {user?.email}
        </span>
        <Button variant="secondary" size="sm" onClick={logout}>
          Cerrar sesion
        </Button>
      </div>
    </header>
  );
}
