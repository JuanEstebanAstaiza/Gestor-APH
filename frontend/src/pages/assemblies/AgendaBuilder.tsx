import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Agenda, type AgendaCreate } from "../../types";

const API_BASE = "/api/assemblies";

export default function AgendaBuilder() {
  const { id } = useParams<{ id: string }>();
  const assemblyId = parseInt(id || "0");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AgendaCreate>({
    assembly_id: assemblyId,
    topic: "",
    order: 1,
  });

  const { data: agendas, isLoading } = useQuery({
    queryKey: ["agendas", assemblyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/assemblies/${assemblyId}/agendas`);
      return data as Agenda[];
    },
    enabled: assemblyId > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: AgendaCreate) => axios.post(`${API_BASE}/assemblies/${assemblyId}/agendas`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agendas", assemblyId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_BASE}/assemblies/${assemblyId}/agendas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agendas", assemblyId] }),
  });

  if (!user || parseInt(user.role) < 3) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Agenda de la Asamblea</h1>
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
          {showForm ? "Cancelar" : "Agregar Tema"}
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
          <h3 style={{ marginTop: 0 }}>Nuevo Tema</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <input
              type="text"
              placeholder="Tema"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Orden"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Duracion (min)"
              value={form.duration_minutes || ""}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Presentador ID"
              value={form.presenter_id || ""}
              onChange={(e) => setForm({ ...form, presenter_id: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.topic}
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
              {createMutation.isPending ? "Agregando..." : "Agregar"}
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Orden</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Tema</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Descripcion</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Presentador</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Duracion</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agendas?.map((a, idx) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{a.order}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{a.topic}</td>
                  <td style={{ padding: 12 }}>{a.description || "--"}</td>
                  <td style={{ padding: 12 }}>{a.presenter_id || "--"}</td>
                  <td style={{ padding: 12 }}>{a.duration_minutes ? `${a.duration_minutes} min` : "--"}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius)",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!agendas?.length && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay temas en la agenda</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
