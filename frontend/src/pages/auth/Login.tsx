import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Credenciales invalidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-subtle)" }}>
      <form onSubmit={handleSubmit} style={{ background: "var(--color-bg)", padding: 40, borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", width: 360 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>Gestor APH</h1>
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginBottom: 24 }}>
          Inicia sesion en tu cuenta
        </p>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <Input type="email" value={email} onChange={setEmail} required />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <Input type="password" value={password} onChange={setPassword} required />
        </div>
        <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Ingresando..." : "Iniciar sesion"}
        </Button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          ¿No tienes cuenta?{" "}
          <a href="/register" style={{ color: "var(--color-primary)" }}>Registrarse</a>
        </p>
      </form>
    </div>
  );
}
