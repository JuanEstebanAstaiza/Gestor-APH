import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";

export default function UserList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/users").then((r) => r.data),
  });

  const columns = [
    { key: "full_name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol" },
    { key: "status", label: "Estado" },
    { key: "is_active", label: "Activo" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Usuarios</h1>
      <a
        href="/users/new"
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "var(--color-primary)",
          color: "#fff",
          borderRadius: "var(--radius)",
          textDecoration: "none",
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        + Nuevo usuario
      </a>
      {data?.data && <DataTable columns={columns} data={data.data} />}
    </div>
  );
}
