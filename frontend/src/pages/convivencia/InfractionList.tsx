import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Infraction } from "../../types";

const API_BASE = "/api/reservations";

const severityColors: Record<string, string> = {
  minor: "#f59e0b",
  moderate: "#f97316",
  severe: "#ef4444",
};

const severityLabels: Record<string, string> = {
  minor: "Leve",
  moderate: "Moderada",
  severe: "Grave",
};

const statusColors: Record<string, string> = {
  open: "#f59e0b",
  acknowledged: "#3b82f6",
  resolved: "#22c55e",
  escalated: "#ef4444",
};

const statusLabels: Record<string, string> = {
  open: "Abierta",
  acknowledged: "Aceptada",
  resolved: "Resuelta",
  escalated: "Escalada",
};

export default function InfractionList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [residentId, setResidentId] = useState("");
  const [showResolve, setShowResolve] = useState<number | null>(null);

  const { data: infractions, isLoading } = useQuery({
    queryKey: ["infractions", statusFilter, residentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      if (residentId) params.set("resident_id", residentId);
      const { data } = await axios.get(`${API_BASE}/infractions`, { params });
      return data as Infraction[];
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/infractions/${id}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["infractions"] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/infractions/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["infractions"] }),
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Infracciones</h1>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierta</option>
          <option value="acknowledged">Aceptada</option>
          <option value="resolved">Resuelta</option>
          <option value="escalated">Escalada</option>
        </select>
        <input
          type="number"
          placeholder="Resident ID"
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Categoria</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Descripcion</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Severidad</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Reincidencia</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Multa</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {infractions?.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12 }}>{i.category}</td>
                  <td style={{ padding: 12 }}>{i.description}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: severityColors[i.severity] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {severityLabels[i.severity] || i.severity}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: i.warning_count > 0 ? "#ef4444" : "transparent",
                      color: i.warning_count > 0 ? "white" : "var(--color-text)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      x{i.warning_count}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    {i.fine_amount ? Number(i.fine_amount).toLocaleString() : "--"}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[i.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {statusLabels[i.status] || i.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {i.status === "open" && (
                        <button
                          onClick={() => acknowledgeMutation.mutate(i.id)}
                          disabled={acknowledgeMutation.isPending}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius)",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Aceptar
                        </button>
                      )}
                      {i.status !== "resolved" && parseInt(user?.role || "0") >= 3 && (
                        <button
                          onClick={() => setShowResolve(i.id)}
                          style={{
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius)",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!infractions?.length && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay infracciones</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showResolve && (
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
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: 20,
            width: 360,
          }}>
            <h3 style={{ marginTop: 0 }}>Resolver Infraccion</h3>
            <p style={{ color: "var(--color-text-muted)" }}>
              Esta accion marcara la infraccion como resuelta.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  resolveMutation.mutate(showResolve);
                  setShowResolve(null);
                }}
                disabled={resolveMutation.isPending}
                style={{
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {resolveMutation.isPending ? "Resolviendo..." : "Confirmar"}
              </button>
              <button
                onClick={() => setShowResolve(null)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
