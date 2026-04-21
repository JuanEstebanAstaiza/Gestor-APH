import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function ShareLinkView() {
  const { token } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["share", token],
    queryFn: () => api.get(`/api/documents/share/${token}`).then((r) => r.data),
    enabled: !!token,
  });

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (!data) return <div style={{ textAlign: "center", padding: 40 }}>Documento no disponible</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid var(--color-border)", borderRadius: 8 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>{data.title}</h1>
      {data.description && <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>{data.description}</p>}
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 24 }}>
        Tipo: {data.file_type} | Fecha: {data.created_at}
      </div>
      <a
        href={data.file_path}
        download
        style={{ display: "inline-block", padding: "10px 24px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none" }}
      >
        Descargar
      </a>
    </div>
  );
}
