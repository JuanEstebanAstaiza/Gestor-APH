import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Assembly, type AssemblyCreate } from "../../types";

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Asambleas</h1>
        {user && parseInt(user.role) >= 3 && (
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
            {showForm ? "Cancelar" : "Nueva Asamblea"}
          </button>
        )}
      </div>

      {showForm && user && parseInt(user.role) >= 3 && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 24,
        }}>
          <h3 style={{ marginTop: 0 }}>Nueva Asamblea</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            >
              <option value="ordinaria">Ordinaria</option>
              <option value="extraordinaria">Extraordinaria</option>
              <option value="especial">Especial</option>
            </select>
            <input
              type="text"
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="text"
              placeholder="Ubicacion"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Quorum %"
              value={form.quorum_required || ""}
              onChange={(e) => setForm({ ...form, quorum_required: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.title || !form.date}
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
          <option value="draft">Borrador</option>
          <option value="announced">Anunciada</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Tipo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Titulo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Ubicacion</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Quorum</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assemblies?.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12 }}>{typeLabels[a.type] || a.type}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{a.title}</td>
                  <td style={{ padding: 12 }}>{a.date}</td>
                  <td style={{ padding: 12 }}>{a.location || "--"}</td>
                  <td style={{ padding: 12 }}>{a.quorum_required}% {a.quorum_achieved ? "✓" : ""}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[a.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    {a.status === "draft" && parseInt(user?.role || "0") >= 3 && (
                      <button
                        onClick={() => announceMutation.mutate(a.id)}
                        disabled={announceMutation.isPending}
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
                        Anunciar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!assemblies?.length && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay asambleas</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
