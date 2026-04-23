import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Infraction } from "../../types";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";

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

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "open", label: "Abierta" },
  { value: "acknowledged", label: "Aceptada" },
  { value: "resolved", label: "Resuelta" },
  { value: "escalated", label: "Escalada" },
];

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

  const isConsejo = user && parseInt(user.role) >= 3;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Infracciones</h1>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} style={{ width: 160 }} />
        <Input type="number" placeholder="Resident ID" value={residentId} onChange={setResidentId} style={{ width: 160 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "category", label: "Categoria" },
            { key: "description", label: "Descripcion" },
            { key: "severity", label: "Severidad" },
            { key: "warning_count", label: "Reincidencia" },
            { key: "fine_amount", label: "Multa" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          data={infractions?.map((i) => ({
            ...i,
            severity: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: severityColors[i.severity] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {severityLabels[i.severity] || i.severity}
              </span>
            ),
            warning_count: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: i.warning_count > 0 ? "#ef4444" : "transparent", color: i.warning_count > 0 ? "white" : "var(--color-text)", fontSize: 12, fontWeight: 600 }}>
                x{i.warning_count}
              </span>
            ),
            fine_amount: i.fine_amount ? Number(i.fine_amount).toLocaleString() : "--",
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[i.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {statusLabels[i.status] || i.status}
              </span>
            ),
            actions: (
              <div style={{ display: "flex", gap: 4 }}>
                {i.status === "open" && (
                  <Button variant="ghost" size="sm" style={{ background: "#3b82f6", color: "white", border: "none" }} disabled={acknowledgeMutation.isPending} onClick={() => acknowledgeMutation.mutate(i.id)}>
                    Aceptar
                  </Button>
                )}
                {i.status !== "resolved" && isConsejo && (
                  <Button variant="ghost" size="sm" style={{ background: "#22c55e", color: "white", border: "none" }} onClick={() => setShowResolve(i.id)}>
                    Resolver
                  </Button>
                )}
              </div>
            ),
          })) || []}
          emptyMessage="No hay infracciones"
        />
      )}
      {showResolve !== null && (
        <Modal isOpen={showResolve !== null} onClose={() => setShowResolve(null)} title="Resolver Infraccion" footer={
          <>
            <Button variant="primary" style={{ background: "var(--color-success)", border: "none" }} disabled={resolveMutation.isPending} onClick={() => { resolveMutation.mutate(showResolve); setShowResolve(null); }}>
              {resolveMutation.isPending ? "Resolviendo..." : "Confirmar"}
            </Button>
            <Button variant="secondary" onClick={() => setShowResolve(null)}>
              Cancelar
            </Button>
          </>
        }>
          <p style={{ color: "var(--color-text-muted)" }}>Esta accion marcara la infraccion como resuelta.</p>
        </Modal>
      )}
    </div>
  );
}
