import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName, phone || undefined);
      navigate("/login");
    } catch {
      setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-subtle)" }}>
      <form onSubmit={handleSubmit} style={{ background: "var(--color-bg)", padding: 40, borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", width: 360 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>Registro</h1>
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginBottom: 24 }}>
          Crea tu cuenta de residente
        </p>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <Input value={fullName} onChange={setFullName} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <Input type="email" value={email} onChange={setEmail} required />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <Input type="password" value={password} onChange={setPassword} required />
        </div>
        <div className="form-group">
          <label className="form-label">Telefono (opcional)</label>
          <Input type="tel" value={phone} onChange={setPhone} />
        </div>
        <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Registrando..." : "Registrarse"}
        </Button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "var(--color-primary)" }}>Iniciar sesion</a>
        </p>
      </form>
    </div>
  );
}
