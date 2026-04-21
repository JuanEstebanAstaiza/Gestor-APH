import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";

export default function VisitorList() {
  const { data } = useQuery({
    queryKey: ["visitors"],
    queryFn: () => api.get("/api/visitors").then((r) => r.data),
  });

  const columns = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "id_document", label: "Documento" },
    { key: "status", label: "Estado" },
    { key: "entry_time", label: "Entrada" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Visitantes</h1>
      <a href="/visitors/new" style={{ display: "inline-block", padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
        + Nuevo visitante
      </a>
      {data?.data && <DataTable columns={columns} data={data.data} />}
    </div>
  );
}
