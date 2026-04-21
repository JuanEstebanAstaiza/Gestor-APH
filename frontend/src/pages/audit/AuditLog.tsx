import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AuditLog() {
  const { data } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api.get("/api/audit/logs").then((r) => r.data),
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Registro de actividad</h1>
      {data?.data && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Usuario ID</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Acción</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Entidad</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((log: Record<string, unknown>) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 12px" }}>{log.user_id ?? "-"}</td>
                  <td style={{ padding: "10px 12px" }}>{log.action}</td>
                  <td style={{ padding: "10px 12px" }}>{log.entity_type}#{log.entity_id ?? "-"}</td>
                  <td style={{ padding: "10px 12px" }}>{log.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
