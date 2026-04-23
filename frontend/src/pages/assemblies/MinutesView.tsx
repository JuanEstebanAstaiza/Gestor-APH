import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Minute, type MinuteCreate } from "../../types";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

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

  const isConsejo = user && parseInt(user.role) >= 3;

  if (!isConsejo) {
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
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nueva Acta"}
        </Button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Nueva Acta</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input type="text" placeholder="Titulo" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Textarea placeholder="Contenido" value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={10} />
            <Button variant="primary" disabled={createMutation.isPending || !form.title || !form.content} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Creando..." : "Guardar Acta"}
            </Button>
          </div>
        </div>
      )}
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {minutes?.map((m) => (
            <div key={m.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{m.title}</h3>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", background: "var(--color-bg-subtle)", padding: "2px 8px", borderRadius: "var(--radius)" }}>
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
