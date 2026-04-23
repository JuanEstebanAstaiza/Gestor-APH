import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useParams, useNavigate } from "react-router-dom";

export default function ProviderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data } = useQuery({
    queryKey: ["provider", id!],
    queryFn: () => api.get(`/api/providers/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const [form, setForm] = useState({
    name: data?.name || "",
    type: data?.type || "empresa",
    specialty: data?.specialty || "",
    contact_name: data?.contact_name || "",
    phone: data?.phone || "",
    email: data?.email || "",
    address: data?.address || "",
    notes: data?.notes || "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        return api.put(`/api/providers/${id}`, form);
      }
      return api.post("/api/providers", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      navigate("/providers");
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
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h1>
      <form onSubmit={handleSubmit}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Nombre *</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Tipo *</label>
          <select
            style={inputStyle}
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            required
          >
            <option value="empresa">Empresa</option>
            <option value="independiente">Independiente</option>
          </select>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Especialidad</label>
          <input
            style={inputStyle}
            value={form.specialty}
            onChange={(e) => handleChange("specialty", e.target.value)}
            placeholder="ej: electricidad, plomeria, ascensores"
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Nombre de contacto</label>
          <input
            style={inputStyle}
            value={form.contact_name}
            onChange={(e) => handleChange("contact_name", e.target.value)}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Teléfono</label>
          <input
            style={inputStyle}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Dirección</label>
          <input
            style={inputStyle}
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Notas</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
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
            {mutation.isPending ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
          <a
            href="/providers"
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
