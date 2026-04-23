import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

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

  const options = [
    { value: "owner", label: "Propietario" },
    { value: "tenant", label: "Arrendatario" },
    { value: "occupant", label: "Ocupante" },
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nuevo residente</h1>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <Select value={propertyType} onChange={setPropertyType} options={options} />
        </div>
        <Button type="submit" variant="primary">
          Crear
        </Button>
      </form>
    </div>
  );
}
