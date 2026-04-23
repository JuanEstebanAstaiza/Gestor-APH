import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
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
    { key: "area_sqm", label: "Area (m²)" },
    { key: "is_active", label: "Activo" },
  ];

  const typeLabels = ASSET_TYPE_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Activos</h1>
      <Button href="/assets/new" variant="primary">
        + Nuevo activo
      </Button>
      <div style={{ marginTop: 16 }}>
        {data?.data && (
          <DataTable
            columns={columns}
            data={data.data.map((a: Record<string, unknown>) => ({
              ...a,
              asset_type: typeLabels[a.asset_type as string] || a.asset_type,
              is_active: a.is_active ? "Si" : "No",
            }))}
          />
        )}
      </div>
    </div>
  );
}
