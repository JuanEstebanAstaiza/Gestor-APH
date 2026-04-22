import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Reservation } from "../../types";

const API_BASE = "/api/reservations";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
  completed: "#3b82f6",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function ReservationList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [assetId, setAssetId] = useState("");
  const [showReject, setShowReject] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", statusFilter, assetId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      if (assetId) params.set("asset_id", assetId);
      const { data } = await axios.get(`${API_BASE}/reservations`, { params });
      return data as Reservation[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/reservations/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      axios.post(`${API_BASE}/reservations/${id}/reject`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/reservations/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Listado de Reservas</h1>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
          <option value="cancelled">Cancelada</option>
          <option value="completed">Completada</option>
        </select>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todas las areas</option>
          <option value="bbq">Parrilla</option>
          <option value="salon">Salon</option>
          <option value="cancha">Cancha</option>
          <option value="piscina">Piscina</option>
          <option value="otros">Otros</option>
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Area</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Desde</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Hasta</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Invitados</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations?.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12 }}>{r.area_name}</td>
                  <td style={{ padding: 12 }}>{r.start_datetime}</td>
                  <td style={{ padding: 12 }}>{r.end_datetime}</td>
                  <td style={{ padding: 12 }}>{r.guests_count}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[r.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {r.status === "pending" && parseInt(user?.role || "0") >= 3 && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(r.id)}
                            disabled={approveMutation.isPending}
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
                            Aprobar
                          </button>
                          <button
                            onClick={() => setShowReject(r.id)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "var(--radius)",
                              padding: "4px 8px",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {(r.status === "pending" || r.status === "approved") && (
                        <button
                          onClick={() => cancelMutation.mutate(r.id)}
                          disabled={cancelMutation.isPending}
                          style={{
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius)",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!reservations?.length && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay reservas</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showReject && (
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
            width: 400,
          }}>
            <h3 style={{ marginTop: 0 }}>Rechazar Reserva</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo"
              rows={4}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  rejectMutation.mutate({ id: showReject, reason: rejectReason || "Sin motivo" });
                  setShowReject(null);
                  setRejectReason("");
                }}
                disabled={rejectMutation.isPending}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {rejectMutation.isPending ? "Rechazando..." : "Confirmar Rechazo"}
              </button>
              <button
                onClick={() => {
                  setShowReject(null);
                  setRejectReason("");
                }}
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
