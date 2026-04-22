import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type PQRSCreate } from "../../types";

const API_BASE = "/api/pqrs";

export default function PQRSForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<PQRSCreate>({
    requester_id: 0,
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
      <div style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: 24,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "var(--color-success)" }}>PQRS Radicado</h2>
        <p style={{ color: "var(--color-text-muted)" }}>Tu solicitud ha sido registrada correctamente.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ requester_id: 0, type: "peticion", subject: "", description: "", category: "otros", priority: "normal" }); }}
          style={{
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "10px 24px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Nueva Solicitud
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nueva PQRS</h1>
      <div style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: 24,
        maxWidth: 600,
      }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            >
              <option value="peticion">Peticion</option>
              <option value="queja">Queja</option>
              <option value="reclamo">Reclamo</option>
              <option value="sugerencia">Sugerencia</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Categoria</label>
            <select
              value={form.category || "otros"}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            >
              <option value="financiero">Financiero</option>
              <option value="convivencia">Convivencia</option>
              <option value="tecnico">Tecnico</option>
              <option value="seguridad">Seguridad</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Prioridad</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            >
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Asunto</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Descripcion</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              style={{ width: "100%", padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
          </div>

          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.subject || !form.description}
            style={{
              background: mutation.isPending || !form.subject || !form.description ? "#9ca3af" : "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 24px",
              cursor: mutation.isPending || !form.subject || !form.description ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {mutation.isPending ? "Enviando..." : "Radicar PQRS"}
          </button>
        </div>
      </div>
    </div>
  );
}
