import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

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

  const options = [
    { value: "pet", label: "Mascota" },
    { value: "renovation", label: "Renovación" },
    { value: "noise_exception", label: "Excepción de ruido" },
    { value: "parking", label: "Parqueadero especial" },
    { value: "other", label: "Otro" },
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nueva solicitud</h1>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <Select value={targetType} onChange={setTargetType} options={options} />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <Textarea value={targetDesc} onChange={setTargetDesc} required />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de vencimiento (opcional)</label>
          <Input type="date" value={expiryDate} onChange={setExpiryDate} />
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <Textarea value={notes} onChange={setNotes} />
        </div>
        <Button type="submit" variant="primary">
          Enviar solicitud
        </Button>
      </form>
    </div>
  );
}
