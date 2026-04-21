import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import { ASSET_TYPE_LABELS } from "../../lib/constants";

export default function AssetList() {
  const { data } = useQuery({
    queryKey: ["assets"],
    queryFn: () => api.get("/api/assets").then((r) => r.data),
  });

  const columns = [
    { key: "asset_type", label: "Tipo" },
    { key: "unit_number", label: "Unidad" },
    { key: "floor", label: "Piso" },
    { key: "area_sqm", label: "Área (m²)" },
    { key: "is_active", label: "Activo" },
  ];

  const typeLabels = ASSET_TYPE_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Activos</h1>
      <a href="/assets/new" style={{ display: "inline-block", padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
        + Nuevo activo
      </a>
      {data?.data && (
        <DataTable
          columns={columns}
          data={data.data.map((a: Record<string, unknown>) => ({
            ...a,
            asset_type: typeLabels[a.asset_type as string] || a.asset_type,
          }))}
        />
      )}
    </div>
  );
}
