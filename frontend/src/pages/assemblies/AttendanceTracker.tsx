import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

  const { data: quorum, isLoading } = useQuery({
    queryKey: ["quorum", assemblyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/assemblies/${assemblyId}/quorum`);
      return data;
    },
    enabled: assemblyId > 0,
  });

  if (isLoading) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Tracker de Asistencia</h1>
      </div>
      {quorum && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{quorum.confirmed}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Confirmados</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{quorum.declined}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Declinados</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{quorum.pending}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Pendientes</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: quorum.quorum_achieved ? "#22c55e" : "#ef4444" }}>{quorum.percentage}%</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Quorum ({quorum.quorum_required}%) {quorum.quorum_achieved ? "✓" : ""}</div>
          </div>
        </div>
      )}
      <div className="card">
        <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
          La lista de asistencia se carga desde el backend
        </div>
      </div>
    </div>
  );
}
