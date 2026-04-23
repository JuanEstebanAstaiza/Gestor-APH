import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type InfractionCreate } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const API_BASE = "/api/reservations";

const CATEGORY_OPTIONS = [
  { value: "ruido", label: "Ruido" },
  { value: "mascotas", label: "Mascotas" },
  { value: "areas_comunes", label: "Areas Comunes" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "otros", label: "Otros" },
];

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Grave" },
];

export default function InfractionForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<InfractionCreate>({
    resident_id: 0,
    asset_id: 0,
    category: "ruido",
    description: "",
    severity: "minor",
    fine_amount: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: InfractionCreate) => axios.post(`${API_BASE}/infractions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infractions"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Error al crear la infraccion");
    },
  });

  if (!user || parseInt(user.role) < 3) return null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Infraccion</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        <Input type="number" placeholder="Resident ID" value={form.resident_id ? String(form.resident_id) : ""} onChange={(v) => setForm({ ...form, resident_id: parseInt(v) || 0 })} />
        <Input type="number" placeholder="Asset ID" value={form.asset_id ? String(form.asset_id) : ""} onChange={(v) => setForm({ ...form, asset_id: parseInt(v) || 0 })} />
        <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORY_OPTIONS} />
        <Select value={form.severity} onChange={(v) => setForm({ ...form, severity: v })} options={SEVERITY_OPTIONS} />
        <Input type="number" placeholder="Multa (opcional)" value={form.fine_amount ? String(form.fine_amount) : ""} onChange={(v) => setForm({ ...form, fine_amount: v })} />
        <Input type="text" placeholder="Descripcion" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        <Button variant="primary" disabled={createMutation.isPending || !form.description} onClick={() => createMutation.mutate(form)}>
          {createMutation.isPending ? "Creando..." : "Registrar Infraccion"}
        </Button>
      </div>
    </div>
  );
}
