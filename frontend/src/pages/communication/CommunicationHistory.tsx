import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Communication } from "../../types";

const API_BASE = "/api/communications";

export default function CommunicationHistory() {
  const { data: comms, isLoading } = useQuery({
    queryKey: ["communications"],
    queryFn: async () => {
      const { data } = await axios.get(API_BASE);
      return data as Communication[];
    },
  });

  const typeIcons: Record<string, string> = {
    email: "📧",
    whatsapp: "💬",
    notification: "🔔",
    circular: "📢",
  };

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    sent: "#22c55e",
    failed: "#ef4444",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Historial de Comunicaciones</h1>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-subtle)" }}>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Tipo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Asunto</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Recipient</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {comms?.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12 }}>{typeIcons[c.type] || "📄"} {c.type}</td>
                  <td style={{ padding: 12 }}>{c.subject || "--"}</td>
                  <td style={{ padding: 12 }}>Recipient #{c.recipient_id}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[c.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{c.sent_at?.slice(0, 10) || "--"}</td>
                </tr>
              ))}
              {!comms?.length && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay comunicaciones</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
