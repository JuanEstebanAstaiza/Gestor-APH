import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function UserForm() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("residente");
  const [error, setError] = useState("");

  const isEdit = window.location.pathname.includes("/users/");

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

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>{isEdit ? "Editar usuario" : "Nuevo usuario"}</h1>
      {error && (
        <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        {!isEdit && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Nombre</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Teléfono</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <option value="admin">Administrador</option>
            <option value="consejo">Consejo</option>
            <option value="vigilancia">Vigilancia</option>
            <option value="residente">Residente</option>
          </select>
        </div>
        <button type="submit"
          style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          {isEdit ? "Guardar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
