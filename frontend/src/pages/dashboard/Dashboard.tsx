import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";

export default function Dashboard() {
  const { user } = useAuth();
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

  const summaryCards = [
    { title: "Residentes", count: "--", icon: "👥" },
    { title: "Activos", count: "--", icon: "🏢" },
    { title: "Visitantes hoy", count: "--", icon: "🚗" },
    { title: "Documentos", count: "--", icon: "📄" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Bienvenido, {user?.full_name}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        Rol: {roleLabel}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {summaryCards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 20,
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{card.count}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
