import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type FAQEntry } from "../../types";
import Input from "../../components/common/Input";

const API_BASE = "/api/faq";

export default function FAQView() {
  const [query, setQuery] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["faq", "search", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("q", query);
      const { data } = await axios.get(`${API_BASE}/search`, { params });
      return data as { data: FAQEntry[] };
    },
    enabled: !!query,
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Preguntas Frecuentes</h1>
      <div style={{ marginBottom: 24 }}>
        <Input type="text" placeholder="Buscar en FAQ..." value={query} onChange={setQuery} style={{ width: "100%", maxWidth: 500, fontSize: 16 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : query && results?.data?.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {results.data.map((item) => (
            <div key={item.id} className="card">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.question}</div>
              <div style={{ color: "var(--color-text-muted)" }}>{item.answer}</div>
            </div>
          ))}
        </div>
      ) : query ? (
        <p style={{ color: "var(--color-text-muted)" }}>No se encontraron resultados para "{query}"</p>
      ) : (
        <p style={{ color: "var(--color-text-muted)" }}>Escribe una pregunta para buscar en las FAQ</p>
      )}
    </div>
  );
}
