import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";

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
      <Button href="/visitors/new" variant="primary">
        + Nuevo visitante
      </Button>
      <div style={{ marginTop: 16 }}>
        {data?.data && <DataTable columns={columns} data={data.data} />}
      </div>
    </div>
  );
}
