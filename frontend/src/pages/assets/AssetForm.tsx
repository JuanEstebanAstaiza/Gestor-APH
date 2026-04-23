import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

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

  const options = [
    { value: "apartment", label: "Apartamento" },
    { value: "parking", label: "Parqueadero" },
    { value: "storage", label: "Depósito" },
    { value: "commercial", label: "Comercial" },
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nuevo activo</h1>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <Select value={assetType} onChange={setAssetType} options={options} />
        </div>
        <div className="form-group">
          <label className="form-label">Numero de unidad</label>
          <Input value={unitNumber} onChange={setUnitNumber} required />
        </div>
        <div className="form-group">
          <label className="form-label">Piso</label>
          <Input type="number" value={floor} onChange={setFloor} />
        </div>
        <div className="form-group">
          <label className="form-label">Area (m²)</label>
          <Input type="number" value={areaSqm} onChange={setAreaSqm} />
        </div>
        <Button type="submit" variant="primary">
          Crear
        </Button>
      </form>
    </div>
  );
}
