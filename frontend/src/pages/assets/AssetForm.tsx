import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AssetForm() {
  const [assetType, setAssetType] = useState("apartment");
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      api.post("/api/assets", {
        asset_type: assetType,
        unit_number: unitNumber,
        floor: floor ? parseInt(floor) : null,
        area_sqm: areaSqm || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      window.location.href = "/assets";
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
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nuevo activo</h1>
      {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Tipo</label>
          <select value={assetType} onChange={(e) => setAssetType(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <option value="apartment">Apartamento</option>
            <option value="parking">Parqueadero</option>
            <option value="storage">Depósito</option>
            <option value="commercial">Comercial</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Número de unidad</label>
          <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Piso</label>
          <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Área (m²)</label>
          <input type="number" step="0.01" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Crear
        </button>
      </form>
    </div>
  );
}
