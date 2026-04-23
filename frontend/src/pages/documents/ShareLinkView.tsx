import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Button from "../../components/common/Button";

export default function ShareLinkView() {
  const { token } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["share", token],
    queryFn: () => api.get(`/api/documents/share/${token}`).then((r) => r.data),
    enabled: !!token,
  });

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">📄</div><h3>Documento no disponible</h3></div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid var(--color-border)", borderRadius: 8 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>{data.title}</h1>
      {data.description && <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>{data.description}</p>}
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 24 }}>
        Tipo: {data.file_type} | Fecha: {data.created_at}
      </div>
      <Button href={data.file_path} variant="primary">
        Descargar
      </Button>
    </div>
  );
}
