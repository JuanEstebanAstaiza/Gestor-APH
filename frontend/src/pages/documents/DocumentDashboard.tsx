import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";

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
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <Button href="/documents/upload" variant="primary">
          + Subir documento
        </Button>
        <Button href="/documents/search" variant="secondary">
          🔍 Buscar
        </Button>
      </div>
      <div style={{ marginTop: 16 }}>
        {data?.data && <DataTable columns={columns} data={data.data} />}
      </div>
    </div>
  );
}
