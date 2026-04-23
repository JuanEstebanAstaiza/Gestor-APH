import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Regulation } from "../../types";
import Button from "../../components/common/Button";

const API_BASE = "/api/reservations";

export default function RegulationView() {
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const { data: regulations, isLoading } = useQuery({
    queryKey: ["regulations", selectedChapter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedChapter) params.set("chapter", selectedChapter);
      const { data } = await axios.get(`${API_BASE}/regulations`, { params });
      return data as Regulation[];
    },
  });

  const chapters = (() => {
    if (!regulations) return [];
    const unique = new Set(regulations.map((r) => r.chapter).filter(Boolean));
    return Array.from(unique);
  })();

  if (isLoading) return <p className="loading">Cargando reglamento...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Reglamento de Propiedad Horizontal</h1>
      </div>
      {chapters.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <Button variant={selectedChapter ? "secondary" : "primary"} size="sm" onClick={() => setSelectedChapter("")}>
            Todos
          </Button>
          {chapters.map((ch) => (
            <Button key={ch} variant={selectedChapter === ch ? "primary" : "secondary"} size="sm" onClick={() => setSelectedChapter(ch)}>
              {ch}
            </Button>
          ))}
        </div>
      )}
      <div className="card">
        {regulations?.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
            No hay reglamentos registrados
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            {regulations?.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  borderBottom: idx < regulations.length - 1 ? "1px solid var(--color-border)" : "none",
                  paddingBottom: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  {r.section_number && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)", background: "var(--color-bg-subtle)", padding: "2px 8px", borderRadius: "var(--radius)" }}>
                      Art. {r.section_number}
                    </span>
                  )}
                  <h3 style={{ margin: 0, fontSize: 18 }}>{r.title}</h3>
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--color-text)" }}>
                  {r.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
