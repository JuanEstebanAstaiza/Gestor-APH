import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";

export default function AuthorizationList() {
  const { data } = useQuery({
    queryKey: ["authorizations"],
    queryFn: () => api.get("/api/authorizations").then((r) => r.data),
  });

  const columns = [
    { key: "target_type", label: "Tipo" },
    { key: "target_desc", label: "Descripción" },
    { key: "status", label: "Estado" },
    { key: "created_at", label: "Fecha" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Autorizaciones</h1>
      <a href="/authorizations/new" style={{ display: "inline-block", padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
        + Nueva solicitud
      </a>
      {data?.data && <DataTable columns={columns} data={data.data} />}
    </div>
  );
}
