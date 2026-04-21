import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function ResidentForm() {
  const [propertyType, setPropertyType] = useState("owner");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      api.post("/api/census/residents", { property_type: propertyType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["census"] });
      window.location.href = "/census";
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
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nuevo residente</h1>
      {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Tipo</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <option value="owner">Propietario</option>
            <option value="tenant">Arrendatario</option>
            <option value="occupant">Ocupante</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Crear
        </button>
      </form>
    </div>
  );
}
