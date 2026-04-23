import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { PROPERTY_TYPE_LABELS } from "../../lib/constants";

export default function ResidentList() {
  const { data } = useQuery({
    queryKey: ["census"],
    queryFn: () => api.get("/api/census/residents").then((r) => r.data),
  });

  const columns = [
    { key: "property_type", label: "Tipo" },
    { key: "move_in_date", label: "Ingreso" },
    { key: "is_active", label: "Activo" },
  ];

  const typeLabels = PROPERTY_TYPE_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Censo</h1>
      <Button href="/census/residents/new" variant="primary">
        + Nuevo residente
      </Button>
      <div style={{ marginTop: 16 }}>
        {data?.data && (
          <DataTable
            columns={columns}
            data={data.data.map((r: Record<string, unknown>) => ({
              ...r,
              property_type: typeLabels[r.property_type as string] || r.property_type,
              is_active: r.is_active ? "Si" : "No",
            }))}
          />
        )}
      </div>
    </div>
  );
}
