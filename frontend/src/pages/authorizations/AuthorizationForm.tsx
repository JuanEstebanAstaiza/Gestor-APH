import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AuthorizationForm() {
  const [targetType, setTargetType] = useState("pet");
  const [targetDesc, setTargetDesc] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      api.post("/api/authorizations", {
        target_type: targetType,
        target_desc: targetDesc,
        expiry_date: expiryDate || null,
        notes: notes || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["authorizations"] });
      window.location.href = "/authorizations";
    },
    onError: () => setError("Error al guardar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nueva solicitud</h1>
      {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Tipo</label>
          <select value={targetType} onChange={(e) => setTargetType(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <option value="pet">Mascota</option>
            <option value="renovation">Renovación</option>
            <option value="noise_exception">Excepción de ruido</option>
            <option value="parking">Parqueadero especial</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Descripción</label>
          <textarea value={targetDesc} onChange={(e) => setTargetDesc(e.target.value)} required rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Fecha de vencimiento (opcional)</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Enviar solicitud
        </button>
      </form>
    </div>
  );
}
