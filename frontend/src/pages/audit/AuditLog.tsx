import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";

export default function AuditLog() {
  const { data } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api.get("/api/audit/logs").then((r) => r.data),
  });

  const columns = [
    { key: "user_id", label: "Usuario ID" },
    { key: "action", label: "Acción" },
    { key: "entity_type", label: "Entidad" },
    { key: "created_at", label: "Fecha" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Registro de actividad</h1>
      <div style={{ marginTop: 16 }}>
        {data?.data && (
          <DataTable
            columns={columns}
            data={data.data.map((log: Record<string, unknown>) => ({
              ...log,
              entity_type: `${log.entity_type}#${log.entity_id ?? "-"}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}
