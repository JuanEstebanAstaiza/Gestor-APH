import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Payment } from "../../types";

const API_BASE = "/api/finance";

export default function PaymentHistory() {
  const [invoiceId, setInvoiceId] = useState("");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["finance", "payments", invoiceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (invoiceId) params.set("invoice_id", invoiceId);
      const { data } = await axios.get(`${API_BASE}/payments`, { params });
      return data as Payment[];
    },
  });

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    verified: "#22c55e",
    rejected: "#ef4444",
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Historial de Pagos</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Invoice ID (filtro)"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-subtle)" }}>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>UUID</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Invoice ID</th>
                <th style={{ padding: 12, textAlign: "right", borderBottom: "1px solid var(--color-border)" }}>Valor</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Metodo</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Referencia</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12 }}>{p.uuid.slice(0, 8)}...</td>
                  <td style={{ padding: 12 }}>{p.invoice_id}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>{Number(p.amount).toLocaleString()}</td>
                  <td style={{ padding: 12 }}>{p.payment_method || "--"}</td>
                  <td style={{ padding: 12 }}>{p.reference_number || "--"}</td>
                  <td style={{ padding: 12 }}>{p.payment_date}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[p.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!payments?.length && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay pagos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
