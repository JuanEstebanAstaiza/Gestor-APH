import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type TaskFollowup, type TaskCreate } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";

const API_BASE = "/api/tasks";

const statusColors: Record<string, string> = {
  open: "#f59e0b",
  in_progress: "#3b82f6",
  completed: "#22c55e",
  overdue: "#ef4444",
  dismissed: "#6b7280",
};

const statusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En progreso",
  completed: "Completada",
  overdue: "Vencida",
  dismissed: "Descartada",
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "open", label: "Abierta" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completada" },
  { value: "overdue", label: "Vencida" },
  { value: "dismissed", label: "Descartada" },
];

export default function TaskList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskCreate>({
    title: "",
    description: "",
    assigned_to: 0,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      const { data } = await axios.get(`${API_BASE}/tasks`, { params });
      return data as TaskFollowup[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskCreate) => axios.post(`${API_BASE}/tasks`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => axios.post(`${API_BASE}/tasks/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const isConsejo = user && parseInt(user.role) >= 3;

  if (!isConsejo) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Seguimiento de Tareas</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nueva Tarea"}
        </Button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Nueva Tarea</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Input type="text" placeholder="Titulo" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Input type="text" placeholder="Descripcion" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            <Input type="number" placeholder="Asignado a (User ID)" value={form.assigned_to ? String(form.assigned_to) : ""} onChange={(v) => setForm({ ...form, assigned_to: parseInt(v) || 0 })} />
            <Input type="date" value={form.deadline || ""} onChange={(v) => setForm({ ...form, deadline: v })} />
            <Button variant="primary" disabled={createMutation.isPending || !form.title || !form.description} onClick={() => createMutation.mutate(form)}>
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
            { key: "title", label: "Titulo" },
            { key: "assigned_to", label: "Asignado" },
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          data={tasks?.map((t) => ({
            ...t,
            deadline: t.deadline || "--",
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[t.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {statusLabels[t.status] || t.status}
              </span>
            ),
            actions: t.status !== "completed" ? (
              <Button variant="ghost" size="sm" style={{ background: "#22c55e", color: "white", border: "none" }} onClick={() => completeMutation.mutate(t.id)}>
                Completar
              </Button>
            ) : null,
          })) || []}
          emptyMessage="No hay tareas"
        />
      )}
    </div>
  );
}
