import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Circular, type CircularCreate } from "../../types";

const API_BASE = "/api/circulars";

export default function CircularDashboard() {
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

  const statusColors: Record<string, string> = {
    draft: "#6b7280",
    sent: "#22c55e",
    scheduled: "#3b82f6",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Circulares</h1>
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
          {showForm ? "Cancelar" : "Nueva Circular"}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 24,
          maxWidth: 600,
        }}>
          <h3 style={{ marginTop: 0 }}>Nueva Circular</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="text"
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <select
              value={form.target_type || "all"}
              onChange={(e) => setForm({ ...form, target_type: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            >
              <option value="all">Todos</option>
              <option value="owners">Solo Propietarios</option>
              <option value="tenants">Solo Arrendatarios</option>
              <option value="specific_tower">Torre Especifica</option>
            </select>
            <textarea
              placeholder="Contenido"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.title || !form.content}
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
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Target</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha Envio</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {circulars?.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{c.title}</td>
                  <td style={{ padding: 12 }}>{c.target_type || "all"}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[c.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{c.sent_at?.slice(0, 10) || "--"}</td>
                  <td style={{ padding: 12 }}>
                    {c.status === "draft" && (
                      <button
                        onClick={() => sendMutation.mutate(c.id)}
                        disabled={sendMutation.isPending}
                        style={{
                          background: "var(--color-secondary)",
                          color: "white",
                          border: "none",
                          borderRadius: "var(--radius)",
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        Enviar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!circulars?.length && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay circulares</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
