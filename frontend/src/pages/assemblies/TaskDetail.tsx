import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type TaskFollowup } from "../../types";

const API_BASE = "/api/tasks";

const statusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En progreso",
  completed: "Completada",
  overdue: "Vencida",
  dismissed: "Descartada",
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id || "0");

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/tasks/${taskId}`);
      return data as TaskFollowup;
    },
    enabled: taskId > 0,
  });

  if (isLoading) return <p>Cargando...</p>;
  if (!task) return <p>Tarea no encontrada</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>{task.title}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Estado</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            <span style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 4,
              background: statusLabels[task.status] ? "#3b82f6" : "#6b7280",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
            }}>
              {statusLabels[task.status] || task.status}
            </span>
          </div>
        </div>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Asignado a</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{task.assigned_to}</div>
        </div>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Deadline</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{task.deadline || "--"}</div>
        </div>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Completada</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{task.completed_at || "--"}</div>
        </div>
      </div>

      <div style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: 20,
      }}>
        <h3 style={{ marginTop: 0 }}>Descripcion</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{task.description}</p>
      </div>

      {task.notes && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginTop: 16,
        }}>
          <h3 style={{ marginTop: 0 }}>Notas</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{task.notes}</p>
        </div>
      )}
    </div>
  );
}
