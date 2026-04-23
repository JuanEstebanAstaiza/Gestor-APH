import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function AlertForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    asset_id: "",
    alert_type: "maintenance",
    description: "",
    scheduled_date: "",
    provider_id: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/maintenance/alerts", {
        ...form,
        asset_id: Number(form.asset_id),
        provider_id: form.provider_id ? Number(form.provider_id) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-dashboard"] });
      navigate("/maintenance");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 500,
  };

  const fieldGroupStyle = {
    marginBottom: 16,
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Nueva Alerta</h1>
      <form onSubmit={handleSubmit}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Activo (asset_id) *</label>
          <input
            style={inputStyle}
            type="number"
            value={form.asset_id}
            onChange={(e) => handleChange("asset_id", e.target.value)}
            required
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Tipo de alerta *</label>
          <select
            style={inputStyle}
            value={form.alert_type}
            onChange={(e) => handleChange("alert_type", e.target.value)}
            required
          >
            <option value="maintenance">Mantenimiento</option>
            <option value="contract_expiry">Vencimiento contrato</option>
            <option value="warranty_expiry">Vencimiento garantía</option>
          </select>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Descripción *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Fecha programada *</label>
          <input
            style={inputStyle}
            type="date"
            value={form.scheduled_date}
            onChange={(e) => handleChange("scheduled_date", e.target.value)}
            required
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Proveedor (opcional)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.provider_id}
            onChange={(e) => handleChange("provider_id", e.target.value)}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Notas</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            style={{
              padding: "8px 24px",
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creando..." : "Crear alerta"}
          </button>
          <a
            href="/maintenance"
            style={{
              padding: "8px 24px",
              color: "var(--color-primary)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
