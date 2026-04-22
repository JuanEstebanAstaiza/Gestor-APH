import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type PazYSalvo } from "../../types";

const API_BASE = "/api/finance";

export default function PazYSalvo() {
  const [residentId, setResidentId] = useState("");

  const { data: pazYSalvo, isLoading } = useQuery({
    queryKey: ["finance", "paz-y-salvo", residentId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/paz-y-salvo/${residentId}`);
      return data as PazYSalvo;
    },
    enabled: !!residentId,
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Paz y Salvo</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="number"
          placeholder="Resident ID"
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : pazYSalvo ? (
        <div style={{
          background: "var(--color-bg)",
          border: `2px solid ${pazYSalvo.is_current ? "var(--color-success)" : "var(--color-error)"}`,
          borderRadius: "var(--radius)",
          padding: 24,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {pazYSalvo.is_current ? "✅" : "⚠"}
          </div>
          <h2 style={{ marginTop: 0, color: pazYSalvo.is_current ? "var(--color-success)" : "var(--color-error)" }}>
            {pazYSalvo.is_current ? "Paz y Salvo Otorgado" : "Paz y Salvo Denegado"}
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            Resident #{pazYSalvo.resident_id}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Balance Total</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{Number(pazYSalvo.total_balance).toLocaleString()}</div>
            </div>
            <div style={{ padding: 12, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Meses en Mora</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{pazYSalvo.months_overdue}</div>
            </div>
            <div style={{ padding: 12, background: "var(--color-bg-subtle)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Generado</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{pazYSalvo.generated_at}</div>
            </div>
          </div>
          {pazYSalvo.is_current && (
            <button style={{
              background: "var(--color-success)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}>
              Descargar Certificado
            </button>
          )}
        </div>
      ) : residentId ? (
        <p style={{ color: "var(--color-text-muted)" }}>No se encontro informacion</p>
      ) : null}
    </div>
  );
}
