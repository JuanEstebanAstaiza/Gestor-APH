import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

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
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <Input value={firstName} onChange={setFirstName} required />
        </div>
        <div className="form-group">
          <label className="form-label">Apellido</label>
          <Input value={lastName} onChange={setLastName} required />
        </div>
        <div className="form-group">
          <label className="form-label">Documento</label>
          <Input value={idDocument} onChange={setIdDocument} required />
        </div>
        <div className="form-group">
          <label className="form-label">Placa (opcional)</label>
          <Input value={vehiclePlate} onChange={setVehiclePlate} />
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <Textarea value={notes} onChange={setNotes} />
        </div>
        <Button type="submit" variant="primary">
          Crear
        </Button>
      </form>
    </div>
  );
}
