import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type InfractionCreate } from "../../types";

const API_BASE = "/api/reservations";

const categories = [
  { value: "ruido", label: "Ruido" },
  { value: "mascotas", label: "Mascotas" },
  { value: "areas_comunes", label: "Areas Comunes" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "otros", label: "Otros" },
];

const severities = [
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

  if (!user || parseInt(user.role) < 3) {
    return null;
  }

  return (
    <div style={{
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: 20,
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Infraccion</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        <input
          type="number"
          placeholder="Resident ID"
          value={form.resident_id || ""}
          onChange={(e) => setForm({ ...form, resident_id: parseInt(e.target.value) || 0 })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="number"
          placeholder="Asset ID"
          value={form.asset_id || ""}
          onChange={(e) => setForm({ ...form, asset_id: parseInt(e.target.value) || 0 })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          {severities.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Multa (opcional)"
          value={form.fine_amount || ""}
          onChange={(e) => setForm({ ...form, fine_amount: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="text"
          placeholder="Descripcion"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <button
          onClick={() => createMutation.mutate(form)}
          disabled={createMutation.isPending || !form.description}
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
          {createMutation.isPending ? "Creando..." : "Registrar Infraccion"}
        </button>
      </div>
    </div>
  );
}
