import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type ReservationCreate } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const API_BASE = "/api/reservations";

const AREA_OPTIONS = [
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
    resident_id: user?.id ? parseInt(user.id) : 0,
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
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Reserva</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        <Input type="number" placeholder="Resident ID" value={form.resident_id || ""} onChange={(v) => setForm({ ...form, resident_id: parseInt(v) || 0 })} />
        <Input type="number" placeholder="Asset ID" value={form.asset_id || ""} onChange={(v) => setForm({ ...form, asset_id: parseInt(v) || 0 })} />
        <Select value={form.area_type} onChange={(v) => setForm({ ...form, area_type: v })} options={AREA_OPTIONS} />
        <Input type="text" placeholder="Nombre del area" value={form.area_name} onChange={(v) => setForm({ ...form, area_name: v })} />
        <Input type="datetime-local" value={form.start_datetime} onChange={(v) => setForm({ ...form, start_datetime: v })} />
        <Input type="datetime-local" value={form.end_datetime} onChange={(v) => setForm({ ...form, end_datetime: v })} />
        <Input type="number" placeholder="Invitados" value={form.guests_count || ""} onChange={(v) => setForm({ ...form, guests_count: parseInt(v) || 0 })} />
        <Input type="text" placeholder="Propósito" value={form.purpose || ""} onChange={(v) => setForm({ ...form, purpose: v })} />
        <Button variant="primary" disabled={createMutation.isPending || !form.area_name || !form.start_datetime || !form.end_datetime} onClick={() => createMutation.mutate(form)}>
          {createMutation.isPending ? "Creando..." : "Crear Reserva"}
        </Button>
      </div>
    </div>
  );
}
