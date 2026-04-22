import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Invoice, type InvoiceCreate } from "../../types";

const API_BASE = "/api/finance";

export default function InvoiceDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [residentId, setResidentId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InvoiceCreate>({
    resident_id: 0,
    asset_id: 0,
    period: "",
    amount: "0",
    due_date: "",
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["finance", "invoices", statusFilter, period, residentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status_filter", statusFilter);
      if (period) params.set("period", period);
      if (residentId) params.set("resident_id", residentId);
      const { data } = await axios.get(`${API_BASE}/invoices`, { params });
      return data as Invoice[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (p: string) =>
      axios.post(`${API_BASE}/invoices/generate`, { period: p }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: InvoiceCreate) => axios.post(`${API_BASE}/invoices`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      setShowForm(false);
    },
  });

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    sent: "#3b82f6",
    paid: "#22c55e",
    overdue: "#ef4444",
    cancelled: "#6b7280",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Cuentas de Cobro</h1>
        {user && parseInt(user.role) >= 3 && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {showForm ? "Cancelar" : "Nueva Factura"}
          </button>
        )}
      </div>

      {showForm && user && parseInt(user.role) >= 3 && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 24,
        }}>
          <h3 style={{ marginTop: 0 }}>Nueva Factura</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <input
              type="number"
              placeholder="Resident ID"
              value={form.resident_id || ""}
              onChange={(e) => setForm({ ...form, resident_id: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="number"
              placeholder="Asset ID"
              value={form.asset_id || ""}
              onChange={(e) => setForm({ ...form, asset_id: parseInt(e.target.value) || 0 })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="month"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="text"
              placeholder="Valor"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              style={{
                background: "var(--color-primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {createMutation.isPending ? "Creando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="month"
          placeholder="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="sent">Enviada</option>
          <option value="paid">Pagada</option>
          <option value="overdue">Vencida</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <input
          type="number"
          placeholder="Resident ID"
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <button
          onClick={() => generateMutation.mutate(period || "")}
          disabled={generateMutation.isPending || !period}
          style={{
            background: "var(--color-secondary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "8px 16px",
            cursor: period ? "pointer" : "not-allowed",
            fontWeight: 600,
          }}
        >
          {generateMutation.isPending ? "Generando..." : "Generar Facturas"}
        </button>
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
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Periodo</th>
                <th style={{ padding: 12, textAlign: "right", borderBottom: "1px solid var(--color-border)" }}>Valor</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Estado</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Fecha Venc.</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Pagada</th>
              </tr>
            </thead>
            <tbody>
              {invoices?.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12 }}>{inv.uuid.slice(0, 8)}...</td>
                  <td style={{ padding: 12 }}>{inv.period}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>{Number(inv.amount).toLocaleString()}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: statusColors[inv.status] || "#6b7280",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{inv.due_date}</td>
                  <td style={{ padding: 12 }}>{inv.paid_at || "--"}</td>
                </tr>
              ))}
              {!invoices?.length && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>No hay facturas</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
