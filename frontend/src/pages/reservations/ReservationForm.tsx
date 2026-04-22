import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type ReservationCreate } from "../../types";

const API_BASE = "/api/reservations";

const areaTypes = [
  { value: "bbq", label: "Parrilla" },
  { value: "salon", label: "Salon" },
  { value: "cancha", label: "Cancha" },
  { value: "piscina", label: "Piscina" },
  { value: "otros", label: "Otros" },
];

interface Props {
  onCreated?: () => void;
}

export default function ReservationForm({ onCreated }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ReservationCreate>({
    resident_id: 0,
    asset_id: 0,
    area_type: "bbq",
    area_name: "",
    start_datetime: "",
    end_datetime: "",
    guests_count: 0,
    purpose: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: ReservationCreate) => axios.post(`${API_BASE}/reservations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      onCreated?.();
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Error al crear la reserva");
    },
  });

  return (
    <div style={{
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: 20,
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Reserva</h3>
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
          value={form.area_type}
          onChange={(e) => setForm({ ...form, area_type: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          {areaTypes.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nombre del area"
          value={form.area_name}
          onChange={(e) => setForm({ ...form, area_name: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="datetime-local"
          value={form.start_datetime}
          onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="datetime-local"
          value={form.end_datetime}
          onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="number"
          placeholder="Invitados"
          value={form.guests_count || ""}
          onChange={(e) => setForm({ ...form, guests_count: parseInt(e.target.value) || 0 })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="text"
          placeholder="Propósito"
          value={form.purpose || ""}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <button
          onClick={() => createMutation.mutate(form)}
          disabled={createMutation.isPending || !form.area_name || !form.start_datetime || !form.end_datetime}
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
          {createMutation.isPending ? "Creando..." : "Crear Reserva"}
        </button>
      </div>
    </div>
  );
}
