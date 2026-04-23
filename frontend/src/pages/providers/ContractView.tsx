import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import { CONTRACT_STATUS_LABELS } from "../../lib/constants";
import { useParams } from "react-router-dom";

export default function ContractView() {
  const { id: providerId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["contracts", providerId!],
    queryFn: () => api.get(`/api/providers/${providerId}/contracts`).then((r) => r.data),
    enabled: !!providerId,
  });

  const columns = [
    { key: "contract_name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "start_date", label: "Inicio" },
    { key: "end_date", label: "Fin" },
    { key: "value", label: "Valor" },
    { key: "status", label: "Estado" },
    { key: "renewal_notice_days", label: "Alerta anticipada (días)" },
  ];

  const statusLabels = CONTRACT_STATUS_LABELS;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Contratos
        {providerId && (
          <span style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
            {" "}
            — Proveedor #{providerId}
          </span>
        )}
      </h1>
      {providerId && (
        <a href={`/providers/${providerId}/contracts/new`} style={{ display: "inline-block", padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: 8, textDecoration: "none", marginBottom: 16, fontSize: 14 }}>
          + Nuevo contrato
        </a>
      )}
      {isLoading && <p>Cargando...</p>}
      {data?.data && (
        <DataTable
          columns={columns}
          data={data.data.map((c: Record<string, unknown>) => ({
            ...c,
            status: statusLabels[c.status as string] || c.status,
          }))}
        />
      )}
      {!providerId && <p>Seleccione un proveedor para ver sus contratos.</p>}
    </div>
  );
}
