import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type FAQEntry, type FAQCreate } from "../../types";

const API_BASE = "/api/faq";

export default function FAQAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FAQCreate>({ question: "", answer: "", category: "otros" });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faqList } = useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data } = await axios.get(API_BASE);
      return data as FAQEntry[];
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["faq", "search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      const { data } = await axios.get(`${API_BASE}/search`, { params });
      return data as FAQSearchResponse;
    },
    enabled: !!searchQuery,
  });

  const createMutation = useMutation({
    mutationFn: (data: FAQCreate) => axios.post(API_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
      setShowForm(false);
    },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Admin FAQ</h1>
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
          {showForm ? "Cancelar" : "Nueva FAQ"}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 24,
          maxWidth: 600,
        }}>
          <h3 style={{ marginTop: 0 }}>Nueva FAQ</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="text"
              placeholder="Pregunta"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <textarea
              placeholder="Respuesta"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={4}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <input
              type="text"
              placeholder="Categoria (separada por comas)"
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
            />
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.question || !form.answer}
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
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)", width: 400 }}
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {(searchQuery && searchResults?.data) || (!searchQuery && faqList) ? (
          (searchQuery && searchResults?.data || faqList)?.map((item) => (
            <div key={item.id} style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 16,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.question}</div>
              <div style={{ color: "var(--color-text-muted)" }}>{item.answer}</div>
              {item.category && <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8, display: "inline-block" }}>{item.category}</span>}
            </div>
          ))
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>No hay FAQs</p>
        )}
      </div>
    </div>
  );
}
