import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type PQRS } from "../../types";

const API_BASE = "/api/pqrs";

export default function PQRSList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  const { data: pqrs, isLoading } = useQuery({
    queryKey: ["pqrs", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      const { data } = await axios.get(API_BASE, { params });
      return data as PQRS[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, response }: { id: number; status: string; response: string }) =>
      axios.put(`${API_BASE}/${id}`, { status, response }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pqrs"] }),
  });

  const statusColors: Record<string, string> = {
    open: "#3b82f6",
    in_progress: "#f59e0b",
    resolved: "#22c55e",
    closed: "#6b7280",
    dismissed: "#ef4444",
  };

  const typeLabels: Record<string, string> = {
    peticion: "Peticion",
    queja: "Queja",
    reclamo: "Reclamo",
    sugerencia: "Sugerencia",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>PQRS</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todos</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En Proceso</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
          <option value="dismissed">Desestimado</option>
        </select>
      </div>

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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>UUID</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Tipo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Asunto</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Prioridad</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pqrs?.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12 }}>{item.uuid.slice(0, 8)}...</td>
                  <td style={{ padding: 12 }}>{typeLabels[item.type] || item.type}</td>
                  <td style={{ padding: 12 }}>{item.subject}</td>
                  <td style={{ padding: 12 }}>{item.priority}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[item.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{item.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
              {!pqrs?.length && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay PQRS</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showDetail !== null && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--color-bg)",
            borderRadius: "var(--radius)",
            padding: 24,
            maxWidth: 500,
            width: "100%",
          }}>
            {pqrs?.find((p) => p.id === showDetail) && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ marginTop: 0 }}>Detalle PQRS</h3>
                  <button onClick={() => setShowDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>X</button>
                </div>
                <p><strong>Asunto:</strong> {pqrs.find(p => p.id === showDetail)?.subject}</p>
                <p><strong>Descripcion:</strong> {pqrs.find(p => p.id === showDetail)?.description}</p>
                <p><strong>Estado:</strong> {pqrs.find(p => p.id === showDetail)?.status}</p>
                <p><strong>Respuesta:</strong> {pqrs.find(p => p.id === showDetail)?.response || "Sin respuesta"}</p>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Agregar respuesta..."
                  rows={3}
                  style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)", marginBottom: 12 }}
                />
                <button
                  onClick={() => {
                    updateMutation.mutate({ id: showDetail, status: "resolved", response: responseText });
                    setShowDetail(null);
                  }}
                  disabled={updateMutation.isPending}
                  style={{
                    background: "var(--color-success)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius)",
                    padding: "10px 24px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {updateMutation.isPending ? "Actualizando..." : "Marcar Resuelto"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
