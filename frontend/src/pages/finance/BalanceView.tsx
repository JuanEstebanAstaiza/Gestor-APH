import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Balance } from "../../types";
import Input from "../../components/common/Input";

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
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: 24 }}>
        <Input type="number" placeholder="Resident ID" value={residentId} onChange={setResidentId} style={{ width: 200 }} />
        <Input type="month" placeholder="Period (opcional)" value={period} onChange={setPeriod} style={{ width: 160 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : balance ? (
        <div className="card" style={{ border: `2px solid ${isCurrent ? "var(--color-success)" : "var(--color-error)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, padding: "4px 12px", borderRadius: 4, background: isCurrent ? "var(--color-success)" : "var(--color-error)", color: "white" }}>
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
