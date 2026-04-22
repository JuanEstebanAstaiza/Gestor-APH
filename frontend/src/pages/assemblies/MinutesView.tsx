import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Minute, type MinuteCreate } from "../../types";

const API_BASE = "/api/assemblies";

export default function MinutesView() {
  const { id } = useParams<{ id: string }>();
  const assemblyId = parseInt(id || "0");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MinuteCreate>({
    assembly_id: assemblyId,
    title: "",
    content: "",
  });

  const { data: minutes, isLoading } = useQuery({
    queryKey: ["minutes", assemblyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/assemblies/${assemblyId}/minutes`);
      return data as Minute[];
    },
    enabled: assemblyId > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: MinuteCreate) => axios.post(`${API_BASE}/assemblies/${assemblyId}/minutes`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["minutes", assemblyId] }),
  });

  if (!user || parseInt(user.role) < 3) {
    return (
      <div>
        <h1 style={{ fontSize: 24 }}>Actas</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Solo el consejo puede crear actas</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Actas de la Asamblea</h1>
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
          {showForm ? "Cancelar" : "Nueva Acta"}
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
          <h3 style={{ marginTop: 0 }}>Nueva Acta</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <textarea
              placeholder="Contenido"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)", boxSizing: "border-box" }}
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
              {createMutation.isPending ? "Creando..." : "Guardar Acta"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {minutes?.map((m) => (
            <div key={m.id} style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{m.title}</h3>
                <span style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  background: "var(--color-bg-subtle)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius)",
                }}>
                  Version {m.version}
                </span>
              </div>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--color-text)" }}>{m.content}</p>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
                {m.approved_by ? "Aprobada por usuario " + m.approved_by : "Sin aprobar"}
              </div>
            </div>
          ))}
          {!minutes?.length && <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>No hay actas</p>}
        </div>
      )}
    </div>
  );
}
