import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  const roleLabel = ROLE_LABELS[user.role];

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Mi perfil</h1>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <span className="form-label">Nombre:</span> {user.full_name}
        </div>
        <div style={{ marginBottom: 12 }}>
          <span className="form-label">Email:</span> {user.email}
        </div>
        <div style={{ marginBottom: 12 }}>
          <span className="form-label">Telefono:</span> {user.phone || "No definido"}
        </div>
        <div style={{ marginBottom: 12 }}>
          <span className="form-label">Rol:</span> {roleLabel}
        </div>
        <div>
          <span className="form-label">Estado:</span> {user.status}
        </div>
      </div>
    </div>
  );
}
