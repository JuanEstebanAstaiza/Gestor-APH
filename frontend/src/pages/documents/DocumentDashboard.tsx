import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";

export default function DocumentDashboard() {
  const { data } = useQuery({
    queryKey: ["documents"],
    queryFn: () => api.get("/api/documents").then((r) => r.data),
  });

  const columns = [
    { key: "title", label: "Título" },
    { key: "file_type", label: "Tipo" },
    { key: "created_at", label: "Fecha" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Documentos</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <a href="/documents/upload" style={{ padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
          + Subir documento
        </a>
        <a href="/documents/search" style={{ padding: "8px 16px", border: "1px solid var(--color-border)", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
          🔍 Buscar
        </a>
      </div>
      {data?.data && <DataTable columns={columns} data={data.data} />}
    </div>
  );
}
