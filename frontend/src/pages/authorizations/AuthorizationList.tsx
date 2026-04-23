import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";

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
      <Button href="/authorizations/new" variant="primary">
        + Nueva solicitud
      </Button>
      <div style={{ marginTop: 16 }}>
        {data?.data && <DataTable columns={columns} data={data.data} />}
      </div>
    </div>
  );
}
