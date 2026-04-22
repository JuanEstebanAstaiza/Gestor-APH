import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const API_BASE = "/api/assemblies";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  declined: "#ef4444",
  absent: "#6b7280",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "Declinado",
  absent: "Ausente",
};

export default function AttendanceTracker() {
  const { id } = useParams<{ id: string }>();
  const assemblyId = parseInt(id || "0");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: quorum } = useQuery({
    queryKey: ["quorum", assemblyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/assemblies/${assemblyId}/quorum`);
      return data;
    },
    enabled: assemblyId > 0,
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Tracker de Asistencia</h1>
      </div>

      {quorum && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{quorum.confirmed}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Confirmados</div>
          </div>
          <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{quorum.declined}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Declinados</div>
          </div>
          <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{quorum.pending}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Pendientes</div>
          </div>
          <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: quorum.quorum_achieved ? "#22c55e" : "#ef4444" }}>{quorum.percentage}%</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Quorum ({quorum.quorum_required}%) {quorum.quorum_achieved ? "✓" : ""}</div>
          </div>
        </div>
      )}

      <div style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-subtle)" }}>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Resident ID</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={2} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
              La lista de asistencia se carga desde el backend
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
