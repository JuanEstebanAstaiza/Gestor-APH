import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type PQRSCreate } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

const API_BASE = "/api/pqrs";

const TYPE_OPTIONS = [
  { value: "peticion", label: "Peticion" },
  { value: "queja", label: "Queja" },
  { value: "reclamo", label: "Reclamo" },
  { value: "sugerencia", label: "Sugerencia" },
];

const CATEGORY_OPTIONS = [
  { value: "financiero", label: "Financiero" },
  { value: "convivencia", label: "Convivencia" },
  { value: "tecnico", label: "Tecnico" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otros", label: "Otros" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

export default function PQRSForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<PQRSCreate>({
    requester_id: user?.id ?? 0,
    type: "peticion",
    subject: "",
    description: "",
    category: "otros",
    priority: "normal",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: PQRSCreate) => axios.post(API_BASE, data),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "var(--color-success)" }}>PQRS Radicado</h2>
        <p style={{ color: "var(--color-text-muted)" }}>Tu solicitud ha sido registrada correctamente.</p>
        <Button variant="primary" onClick={() => { setSubmitted(false); setForm({ requester_id: user?.id ?? 0, type: "peticion", subject: "", description: "", category: "otros", priority: "normal" }); }}>
          Nueva Solicitud
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nueva PQRS</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label className="form-label">Tipo</label>
            <Select value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPE_OPTIONS} />
          </div>
          <div>
            <label className="form-label">Categoria</label>
            <Select value={form.category ?? "otros"} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORY_OPTIONS} />
          </div>
          <div>
            <label className="form-label">Prioridad</label>
            <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITY_OPTIONS} />
          </div>
          <div>
            <label className="form-label">Asunto</label>
            <Input type="text" placeholder="Asunto" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
          </div>
          <div>
            <label className="form-label">Descripcion</label>
            <Textarea placeholder="Descripcion" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={5} />
          </div>
          <Button variant="primary" disabled={mutation.isPending || !form.subject || !form.description} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? "Enviando..." : "Radicar PQRS"}
          </Button>
        </div>
      </div>
    </div>
  );
}
