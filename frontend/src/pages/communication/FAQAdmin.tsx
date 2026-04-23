import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type FAQEntry, type FAQCreate } from "../../types";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

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
      return data as { data: FAQEntry[] };
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

  const displayItems = (searchQuery && searchResults?.data) || (!searchQuery && faqList);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Admin FAQ</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nueva FAQ"}
        </Button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
          <h3 style={{ marginTop: 0 }}>Nueva FAQ</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <Input type="text" placeholder="Pregunta" value={form.question} onChange={(v) => setForm({ ...form, question: v })} />
            <Textarea placeholder="Respuesta" value={form.answer} onChange={(v) => setForm({ ...form, answer: v })} rows={4} />
            <Input type="text" placeholder="Categoria (separada por comas)" value={form.category || ""} onChange={(v) => setForm({ ...form, category: v })} />
            <Button variant="primary" disabled={createMutation.isPending || !form.question || !form.answer} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <Input type="text" placeholder="Buscar FAQ..." value={searchQuery} onChange={setSearchQuery} style={{ width: 400 }} />
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {displayItems ? (
          displayItems.map((item) => (
            <div key={item.id} className="card">
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
