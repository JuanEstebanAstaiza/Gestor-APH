import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Assembly } from "../../types";
import Button from "../../components/common/Button";

const API_BASE = "/api/assemblies";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  announced: "Anunciada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const typeLabels: Record<string, string> = {
  ordinaria: "Ordinaria",
  extraordinaria: "Extraordinaria",
  especial: "Especial",
};

export default function AssemblyDetail() {
  const { id } = useParams<{ id: string }>();
  const assemblyId = parseInt(id || "0");

  const { data: assembly, isLoading } = useQuery({
    queryKey: ["assemblies", assemblyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/assemblies/${assemblyId}`);
      return data as Assembly;
    },
    enabled: assemblyId > 0,
  });

  if (isLoading) return <p className="loading">Cargando...</p>;
  if (!assembly) return <p>Asamblea no encontrada</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>{assembly.title}</h1>
        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 4, background: "#3b82f6", color: "white", fontSize: 13, fontWeight: 600 }}>
          {statusLabels[assembly.status] || assembly.status}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Tipo</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{typeLabels[assembly.type] || assembly.type}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Fecha</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{assembly.date}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Ubicacion</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{assembly.location || "--"}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Quorum</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{assembly.quorum_required}% {assembly.quorum_achieved ? "✓" : ""}</div>
        </div>
      </div>
      {assembly.description && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Descripcion</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{assembly.description}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="primary" href={`/assemblies/${assemblyId}/agendas`}>
          Ver Agenda
        </Button>
        <Button variant="secondary" href={`/assemblies/${assemblyId}/attendance`}>
          Asistencia
        </Button>
        <Button variant="secondary" href={`/assemblies/${assemblyId}/minutes`}>
          Actas
        </Button>
      </div>
    </div>
  );
}
