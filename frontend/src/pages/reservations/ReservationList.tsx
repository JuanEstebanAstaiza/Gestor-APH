import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Reservation } from "../../types";
import Select from "../../components/common/Select";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

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

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobada" },
  { value: "rejected", label: "Rechazada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "completed", label: "Completada" },
];

const ASSET_OPTIONS = [
  { value: "", label: "Todas las areas" },
  { value: "bbq", label: "Parrilla" },
  { value: "salon", label: "Salon" },
  { value: "cancha", label: "Cancha" },
  { value: "piscina", label: "Piscina" },
  { value: "otros", label: "Otros" },
];

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

  const isConsejo = user && parseInt(user.role) >= 3;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Listado de Reservas</h1>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} style={{ width: 160 }} />
        <Select value={assetId} onChange={setAssetId} options={ASSET_OPTIONS} style={{ width: 160 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "area_name", label: "Area" },
            { key: "start_datetime", label: "Desde" },
            { key: "end_datetime", label: "Hasta" },
            { key: "guests_count", label: "Invitados" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          data={reservations?.map((r) => ({
            ...r,
            area_name: r.area_name,
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[r.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {statusLabels[r.status] || r.status}
              </span>
            ),
            actions: (
              <div style={{ display: "flex", gap: 4 }}>
                {r.status === "pending" && isConsejo && (
                  <>
                    <Button variant="ghost" size="sm" style={{ background: "#22c55e", color: "white", border: "none" }} disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(r.id)}>
                      Aprobar
                    </Button>
                    <Button variant="ghost" size="sm" style={{ background: "#ef4444", color: "white", border: "none" }} onClick={() => setShowReject(r.id)}>
                      Rechazar
                    </Button>
                  </>
                )}
                {(r.status === "pending" || r.status === "approved") && (
                  <Button variant="ghost" size="sm" style={{ background: "#6b7280", color: "white", border: "none" }} disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate(r.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
            ),
          })) || []}
          emptyMessage="No hay reservas"
        />
      )}
      {showReject !== null && (
        <Modal onClose={() => { setShowReject(null); setRejectReason(""); }}>
          <Modal.Header>
            <h3 style={{ marginTop: 0 }}>Rechazar Reserva</h3>
          </Modal.Header>
          <Modal.Body>
            <Textarea value={rejectReason} onChange={(v) => setRejectReason(v)} placeholder="Motivo del rechazo" rows={4} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" disabled={rejectMutation.isPending} onClick={() => { rejectMutation.mutate({ id: showReject, reason: rejectReason || "Sin motivo" }); setShowReject(null); setRejectReason(""); }}>
              {rejectMutation.isPending ? "Rechazando..." : "Confirmar Rechazo"}
            </Button>
            <Button variant="secondary" onClick={() => { setShowReject(null); setRejectReason(""); }}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
