import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { ROLE_LABELS } from "../../lib/constants";

export default function UserList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/users").then((r) => r.data),
  });

  const columns = [
    { key: "full_name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol", sortable: true },
    { key: "status", label: "Estado" },
    { key: "is_active", label: "Activo" },
  ];

  const roleLabels = ROLE_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Usuarios</h1>
      <Button href="/users/new" variant="primary">
        + Nuevo usuario
      </Button>
      <div style={{ marginTop: 16 }}>
        {data?.data && (
          <DataTable
            columns={columns}
            data={data.data.map((u: Record<string, unknown>) => ({
              ...u,
              role: roleLabels[u.role as string] || u.role,
              is_active: u.is_active ? "Si" : "No",
            }))}
          />
        )}
      </div>
    </div>
  );
}
