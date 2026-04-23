import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ALERT_TYPE_LABELS, ALERT_STATUS_LABELS } from "../../lib/constants";

export default function MaintenanceCalendar() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-alerts"],
    queryFn: () => api.get("/api/maintenance/alerts").then((r) => r.data),
  });

  const typeLabels = ALERT_TYPE_LABELS;
  const statusLabels = ALERT_STATUS_LABELS;

  if (isLoading) return <p>Cargando calendario...</p>;

  const alerts = data?.data || [];

  // Group by month
  const grouped: Record<string, typeof alerts> = {};
  for (const alert of alerts) {
    const date = alert.scheduled_date as string;
    const month = date.substring(0, 7); // YYYY-MM
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(alert);
  }

  const sortedMonths = Object.keys(grouped).sort();

  const statusColor: Record<string, string> = {
    pending: "#f59e0b",
    notified: "#3b82f6",
    completed: "#10b981",
    dismissed: "#6b7280",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Calendario de Mantenimiento</h1>
      {sortedMonths.length === 0 && <p>No hay alertas programadas.</p>}
      {sortedMonths.map((month) => {
        const [year, mon] = month.split("-");
        const monthName = new Date(Number(year), Number(mon) - 1).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
        });
        return (
          <div key={month} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8, borderBottom: "1px solid var(--color-border)", paddingBottom: 4 }}>
              {monthName}
            </h2>
            <div style={{ display: "grid", gap: 8 }}>
              {grouped[month].map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 12,
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    borderLeft: `4px solid ${statusColor[alert.status] || "#6b7280"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>
                      {typeLabels[alert.alert_type as string] || alert.alert_type}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                      {alert.scheduled_date}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{alert.description}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                    Estado: {statusLabels[alert.status as string] || alert.status}
                    {alert.provider_id && ` · Proveedor #${alert.provider_id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
