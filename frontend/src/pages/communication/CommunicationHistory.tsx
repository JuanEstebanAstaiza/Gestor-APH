import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Communication } from "../../types";
import DataTable from "../../components/common/DataTable";

const API_BASE = "/api/communications";

const typeIcons: Record<string, string> = {
  email: "📧",
  whatsapp: "💬",
  notification: "🔔",
  circular: "📢",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  sent: "#22c55e",
  failed: "#ef4444",
};

export default function CommunicationHistory() {
  const { data: comms, isLoading } = useQuery({
    queryKey: ["communications"],
    queryFn: async () => {
      const { data } = await axios.get(API_BASE);
      return data as Communication[];
    },
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Historial de Comunicaciones</h1>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "type", label: "Tipo" },
            { key: "subject", label: "Asunto" },
            { key: "recipient_id", label: "Recipient" },
            { key: "status", label: "Estado" },
            { key: "sent_at", label: "Fecha" },
          ]}
          data={comms?.map((c) => ({
            ...c,
            type: `${typeIcons[c.type] || "📄"} ${c.type}`,
            subject: c.subject || "--",
            recipient_id: `Recipient #${c.recipient_id}`,
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[c.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {c.status}
              </span>
            ),
            sent_at: c.sent_at?.slice(0, 10) || "--",
          })) || []}
          emptyMessage="No hay comunicaciones"
        />
      )}
    </div>
  );
}
