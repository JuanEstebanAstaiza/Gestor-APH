import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type TaskFollowup, type TaskCreate } from "../../types";

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

  if (!user || parseInt(user.role) < 3) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Seguimiento de Tareas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {showForm ? "Cancelar" : "Nueva Tarea"}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 24,
        }}>
          <h3 style={{ marginTop: 0 }}>Nueva Tarea</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <input
              type="text"
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="text"
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Asignado a (User ID)"
              value={form.assigned_to || ""}
              onChange={(e) => setForm({ ...form, assigned_to: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="date"
              value={form.deadline || ""}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.title || !form.description}
              style={{
                background: "var(--color-primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {createMutation.isPending ? "Creando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierta</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completada</option>
          <option value="overdue">Vencida</option>
          <option value="dismissed">Descartada</option>
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Titulo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Asignado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Deadline</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{t.title}</td>
                  <td style={{ padding: 12 }}>{t.assigned_to}</td>
                  <td style={{ padding: 12 }}>{t.deadline || "--"}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[t.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {statusLabels[t.status] || t.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    {t.status !== "completed" && (
                      <button
                        onClick={() => completeMutation.mutate(t.id)}
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
                        Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!tasks?.length && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay tareas</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
