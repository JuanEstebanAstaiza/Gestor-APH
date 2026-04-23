import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Agenda, type AgendaCreate } from "../../types";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";

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
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Agregar Tema"}
        </Button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Nuevo Tema</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Input type="text" placeholder="Tema" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} />
            <Input type="number" placeholder="Orden" value={String(form.order)} onChange={(v) => setForm({ ...form, order: parseInt(v) || 1 })} />
            <Input type="number" placeholder="Duracion (min)" value={form.duration_minutes ? String(form.duration_minutes) : ""} onChange={(v) => setForm({ ...form, duration_minutes: parseInt(v) || 0 })} />
            <Input type="number" placeholder="Presentador ID" value={form.presenter_id ? String(form.presenter_id) : ""} onChange={(v) => setForm({ ...form, presenter_id: parseInt(v) || 0 })} />
            <Button variant="primary" disabled={createMutation.isPending || !form.topic} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </div>
      )}
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "order", label: "Orden" },
            { key: "topic", label: "Tema" },
            { key: "description", label: "Descripcion" },
            { key: "presenter_id", label: "Presentador" },
            { key: "duration_minutes", label: "Duracion" },
            { key: "actions", label: "Acciones" },
          ]}
          data={agendas?.map((a) => ({
            ...a,
            duration_minutes: a.duration_minutes ? `${a.duration_minutes} min` : "--",
            actions: (
              <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(a.id)}>
                Eliminar
              </Button>
            ),
          })) || []}
          emptyMessage="No hay temas en la agenda"
        />
      )}
    </div>
  );
}
