import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Balance } from "../../types";

const API_BASE = "/api/finance";

export default function BalanceView() {
  const [residentId, setResidentId] = useState("");
  const [period, setPeriod] = useState("");

  const { data: balance, isLoading } = useQuery({
    queryKey: ["finance", "balance", residentId, period],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("resident_id", residentId);
      if (period) params.set("period", period);
      const { data } = await axios.get(`${API_BASE}/balance/${residentId}`, { params });
      return data as Balance;
    },
    enabled: !!residentId,
  });

  const isCurrent = balance?.balance === "0" && balance?.months_overdue === 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Consulta de Balance</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="number"
          placeholder="Resident ID"
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="month"
          placeholder="Period (opcional)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : balance ? (
        <div style={{
          background: "var(--color-bg)",
          border: `2px solid ${isCurrent ? "var(--color-success)" : "var(--color-error)"}`,
          borderRadius: "var(--radius)",
          padding: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 4,
              background: isCurrent ? "var(--color-success)" : "var(--color-error)",
              color: "white",
            }}>
              {isCurrent ? "Al Dia" : "Con Mora"}
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>Resident #{balance.resident_id}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            <div style={{ padding: 16, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>Total Adeudado</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{Number(balance.total_due).toLocaleString()}</div>
            </div>
            <div style={{ padding: 16, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>Total Pagado</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-success)" }}>{Number(balance.total_paid).toLocaleString()}</div>
            </div>
            <div style={{ padding: 16, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>Balance</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: isCurrent ? "var(--color-success)" : "var(--color-error)" }}>
                {Number(balance.balance).toLocaleString()}
              </div>
            </div>
            <div style={{ padding: 16, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>Meses en Mora</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: balance.months_overdue > 0 ? "var(--color-error)" : "var(--color-success)" }}>
                {balance.months_overdue}
              </div>
            </div>
          </div>
        </div>
      ) : residentId ? (
        <p style={{ color: "var(--color-text-muted)" }}>No se encontro balance</p>
      ) : null}
    </div>
  );
}
