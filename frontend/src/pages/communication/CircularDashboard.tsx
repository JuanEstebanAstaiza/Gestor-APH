import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Circular, type CircularCreate } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";

const API_BASE = "/api/circulars";

const TARGET_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "owners", label: "Solo Propietarios" },
  { value: "tenants", label: "Solo Arrendatarios" },
  { value: "specific_tower", label: "Torre Especifica" },
];

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  sent: "#22c55e",
  scheduled: "#3b82f6",
};

export default function CircularDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CircularCreate>({ title: "", content: "", target_type: "all" });

  const { data: circulars, isLoading } = useQuery({
    queryKey: ["circulars"],
    queryFn: async () => {
      const { data } = await axios.get(API_BASE);
      return data as Circular[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CircularCreate) => axios.post(API_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
      setShowForm(false);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/${id}/send`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["circulars"] }),
  });

  const isConsejo = user && parseInt(user.role) >= 3;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Circulares</h1>
        {isConsejo && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nueva Circular"}
          </Button>
        )}
      </div>
      {showForm && isConsejo && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
          <h3 style={{ marginTop: 0 }}>Nueva Circular</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <Input type="text" placeholder="Titulo" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Select value={form.target_type || "all"} onChange={(v) => setForm({ ...form, target_type: v })} options={TARGET_OPTIONS} />
            <Textarea placeholder="Contenido" value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={6} />
            <Button variant="primary" disabled={createMutation.isPending || !form.title || !form.content} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "title", label: "Titulo" },
            { key: "target_type", label: "Target" },
            { key: "status", label: "Estado" },
            { key: "sent_at", label: "Fecha Envio" },
            { key: "actions", label: "Acciones" },
          ]}
          data={circulars?.map((c) => ({
            ...c,
            target_type: c.target_type || "all",
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[c.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {c.status}
              </span>
            ),
            sent_at: c.sent_at?.slice(0, 10) || "--",
            actions: c.status === "draft" ? (
              <Button variant="secondary" size="sm" disabled={sendMutation.isPending} onClick={() => sendMutation.mutate(c.id)}>
                Enviar
              </Button>
            ) : null,
          })) || []}
          emptyMessage="No hay circulares"
        />
      )}
    </div>
  );
}
