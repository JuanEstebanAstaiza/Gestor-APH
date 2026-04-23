import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

export default function UserForm() {
  const qc = useQueryClient();
  const isEdit = window.location.pathname.includes("/users/");

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.get(window.location.pathname).then((r) => r.data),
    enabled: isEdit,
  });

  const [email, setEmail] = useState(data?.email || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(data?.full_name || "");
  const [phone, setPhone] = useState(data?.phone || "");
  const [role, setRole] = useState(data?.role || "residente");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = { email, full_name: fullName, phone: phone || null, role };
      if (password) body.password = password;
      return isEdit
        ? api.patch(window.location.pathname, body)
        : api.post("/api/users", body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      window.location.href = "/users";
    },
    onError: () => setError("Error al guardar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  const options = [
    { value: "admin", label: "Administrador" },
    { value: "consejo", label: "Consejo" },
    { value: "vigilancia", label: "Vigilancia" },
    { value: "residente", label: "Residente" },
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>{isEdit ? "Editar usuario" : "Nuevo usuario"}</h1>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <Input type="email" value={email} onChange={setEmail} required />
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <Input type="password" value={password} onChange={setPassword} required />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <Input value={fullName} onChange={setFullName} required />
        </div>
        <div className="form-group">
          <label className="form-label">Telefono</label>
          <Input type="tel" value={phone} onChange={setPhone} />
        </div>
        <div className="form-group">
          <label className="form-label">Rol</label>
          <Select value={role} onChange={setRole} options={options} />
        </div>
        <Button type="submit" variant="primary">
          {isEdit ? "Guardar" : "Crear"}
        </Button>
      </form>
    </div>
  );
}
