import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type PQRS } from "../../types";
import Select from "../../components/common/Select";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

const API_BASE = "/api/pqrs";

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

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En Proceso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
  { value: "dismissed", label: "Desestimado" },
];

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

  const currentItem = pqrs?.find((p) => p.id === showDetail);

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>PQRS</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} style={{ width: 160 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "uuid", label: "UUID" },
            { key: "type", label: "Tipo" },
            { key: "subject", label: "Asunto" },
            { key: "priority", label: "Prioridad" },
            { key: "status", label: "Estado" },
          ]}
          data={pqrs?.map((item) => ({
            ...item,
            uuid: `${item.uuid.slice(0, 8)}...`,
            type: typeLabels[item.type] || item.type,
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[item.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {item.status}
              </span>
            ),
          })) || []}
          emptyMessage="No hay PQRS"
          onRowClick={(row) => setShowDetail(row.id as number)}
        />
      )}
      {showDetail !== null && currentItem && (
        <Modal isOpen={showDetail !== null} onClose={() => setShowDetail(null)} title="Detalle PQRS" footer={
          <Button variant="primary" style={{ background: "var(--color-success)", border: "none" }} disabled={updateMutation.isPending} onClick={() => { updateMutation.mutate({ id: showDetail, status: "resolved", response: responseText }); setShowDetail(null); }}>
            {updateMutation.isPending ? "Actualizando..." : "Marcar Resuelto"}
          </Button>
        }>
          <p><strong>Asunto:</strong> {currentItem.subject}</p>
          <p><strong>Descripcion:</strong> {currentItem.description}</p>
          <p><strong>Estado:</strong> {currentItem.status}</p>
          <p><strong>Respuesta:</strong> {currentItem.response || "Sin respuesta"}</p>
          <Textarea value={responseText} onChange={(v) => setResponseText(v)} placeholder="Agregar respuesta..." rows={3} />
        </Modal>
      )}
    </div>
  );
}
