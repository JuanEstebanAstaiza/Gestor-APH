import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Assembly, type AssemblyCreate } from "../../types";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";

const API_BASE = "/api/assemblies";

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  announced: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

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

const TYPE_OPTIONS = [
  { value: "ordinaria", label: "Ordinaria" },
  { value: "extraordinaria", label: "Extraordinaria" },
  { value: "especial", label: "Especial" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "announced", label: "Anunciada" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function AssemblyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AssemblyCreate>({
    type: "ordinaria",
    title: "",
    date: "",
    quorum_required: 50,
  });

  const { data: assemblies, isLoading } = useQuery({
    queryKey: ["assemblies", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      const { data } = await axios.get(`${API_BASE}/assemblies`, { params });
      return data as Assembly[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AssemblyCreate) => axios.post(`${API_BASE}/assemblies`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assemblies"] });
      setShowForm(false);
    },
  });

  const announceMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/assemblies/${id}/announce`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assemblies"] }),
  });

  const isConsejo = user && parseInt(user.role) >= 3;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Asambleas</h1>
        {isConsejo && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nueva Asamblea"}
          </Button>
        )}
      </div>
      {showForm && isConsejo && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Nueva Asamblea</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Select value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPE_OPTIONS} />
            <Input type="text" placeholder="Titulo" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Input type="datetime-local" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <Input type="text" placeholder="Ubicacion" value={form.location || ""} onChange={(v) => setForm({ ...form, location: v })} />
            <Input type="number" placeholder="Quorum %" value={form.quorum_required ? String(form.quorum_required) : ""} onChange={(v) => setForm({ ...form, quorum_required: parseInt(v) || 0 })} />
            <Button variant="primary" disabled={createMutation.isPending || !form.title || !form.date} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Creando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} style={{ width: 160 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "type", label: "Tipo" },
            { key: "title", label: "Titulo" },
            { key: "date", label: "Fecha" },
            { key: "location", label: "Ubicacion" },
            { key: "quorum", label: "Quorum" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          data={assemblies?.map((a) => ({
            ...a,
            type: typeLabels[a.type] || a.type,
            location: a.location || "--",
            quorum: `${a.quorum_required}% ${a.quorum_achieved ? "✓" : ""}`,
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[a.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {statusLabels[a.status] || a.status}
              </span>
            ),
            actions: a.status === "draft" && isConsejo ? (
              <Button variant="ghost" size="sm" style={{ background: "#3b82f6", color: "white", border: "none" }} disabled={announceMutation.isPending} onClick={() => announceMutation.mutate(a.id)}>
                Anunciar
              </Button>
            ) : null,
          })) || []}
          emptyMessage="No hay asambleas"
        />
      )}
    </div>
  );
}
