import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Mi perfil</h1>
      <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <strong>Nombre:</strong> {user.full_name}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Email:</strong> {user.email}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Teléfono:</strong> {user.phone || "No definido"}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Rol:</strong> {user.role}
        </div>
        <div>
          <strong>Estado:</strong> {user.status}
        </div>
      </div>
    </div>
  );
}
