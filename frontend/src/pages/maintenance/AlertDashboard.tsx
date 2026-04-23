import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import { ALERT_TYPE_LABELS, ALERT_STATUS_LABELS } from "../../lib/constants";

export default function AlertDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-dashboard"],
    queryFn: () => api.get("/api/maintenance/dashboard").then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (alertId: number) => api.post(`/api/maintenance/alerts/${alertId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-dashboard"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (alertId: number) => api.post(`/api/maintenance/alerts/${alertId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-dashboard"] });
    },
  });

  const typeLabels = ALERT_TYPE_LABELS;
  const statusLabels = ALERT_STATUS_LABELS;

  const summaryCards = data?.summary || [];
  const alerts = data?.alerts || [];

  const alertColumns = [
    { key: "alert_type", label: "Tipo" },
    { key: "description", label: "Descripción" },
    { key: "scheduled_date", label: "Fecha programada" },
    { key: "status", label: "Estado" },
    { key: "actions", label: "Acciones" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Dashboard de Alertas</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 16, background: "#fff", borderRadius: 8, border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data?.total_pending ?? 0}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Pendientes</div>
        </div>
        <div style={{ padding: 16, background: "#fff", borderRadius: 8, border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "var(--color-error)" }}>
            {data?.total_overdue ?? 0}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Vencidas</div>
        </div>
        <div style={{ padding: 16, background: "#fff", borderRadius: 8, border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "var(--color-success)" }}>
            {data?.total_completed ?? 0}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Completadas</div>
        </div>
      </div>

      {summaryCards.length > 0 && (
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Resumen por activo</h2>
      )}
      {summaryCards.length > 0 && (
        <DataTable
          columns={[
            { key: "asset_unit_number", label: "Unidad" },
            { key: "asset_type", label: "Tipo" },
            { key: "pending_count", label: "Pendientes" },
            { key: "overdue_count", label: "Vencidas" },
            { key: "upcoming_count", label: "Próximas (30 días)" },
          ]}
          data={summaryCards}
        />
      )}

      {alerts.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 24 }}>
            Alertas pendientes y próximas
          </h2>
          <DataTable
            columns={alertColumns}
            data={alerts.map((a: Record<string, unknown>) => ({
              ...a,
              alert_type: typeLabels[a.alert_type as string] || a.alert_type,
              status: statusLabels[a.status as string] || a.status,
              actions: (
                <span style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => completeMutation.mutate(a.id as number)}
                    style={{
                      padding: "4px 12px",
                      background: "var(--color-success)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => dismissMutation.mutate(a.id as number)}
                    style={{
                      padding: "4px 12px",
                      background: "var(--color-text-secondary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Descartar
                  </button>
                </span>
              ),
            }))}
          />
        </>
      )}
    </div>
  );
}
