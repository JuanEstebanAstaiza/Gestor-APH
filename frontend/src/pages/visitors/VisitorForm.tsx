import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function VisitorForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idDocument, setIdDocument] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      api.post("/api/visitors", { first_name: firstName, last_name: lastName, id_document: idDocument, vehicle_plate: vehiclePlate || null, notes: notes || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      window.location.href = "/visitors";
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
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nuevo visitante</h1>
      {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Nombre</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Apellido</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Documento</label>
          <input type="text" value={idDocument} onChange={(e) => setIdDocument(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Placa (opcional)</label>
          <input type="text" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Crear
        </button>
      </form>
    </div>
  );
}
