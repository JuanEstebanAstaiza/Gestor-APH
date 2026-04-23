import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import { PROVIDER_TYPE_LABELS } from "../../lib/constants";

export default function ProviderList() {
  const { data, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: () => api.get("/api/providers").then((r) => r.data),
  });

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "type", label: "Tipo" },
    { key: "specialty", label: "Especialidad" },
    { key: "contact_name", label: "Contacto" },
    { key: "phone", label: "Teléfono" },
    { key: "email", label: "Email" },
    { key: "is_active", label: "Activo" },
  ];

  const typeLabels = PROVIDER_TYPE_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Directorio de Proveedores</h1>
      <a href="/providers/new" style={{ display: "inline-block", padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
        + Nuevo proveedor
      </a>
      {isLoading && <p>Cargando...</p>}
      {data?.data && (
        <DataTable
          columns={columns}
          data={data.data.map((p: Record<string, unknown>) => ({
            ...p,
            type: typeLabels[p.type as string] || p.type,
            is_active: p.is_active ? "Sí" : "No",
          }))}
        />
      )}
    </div>
  );
}
