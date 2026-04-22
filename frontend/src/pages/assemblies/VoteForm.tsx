import { useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const API_BASE = "/api/assemblies";

const voteOptions = [
  { value: "favor", label: "A favor" },
  { value: "en_contra", label: "En contra" },
  { value: "abstencion", label: "Abstencion" },
];

export default function VoteForm() {
  const { id } = useParams<{ id: string }>();
  const assemblyId = parseInt(id || "0");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [option, setOption] = useState("favor");
  const [notes, setNotes] = useState("");
  const [agendaItemId, setAgendaItemId] = useState("");

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");
      return axios.post(`${API_BASE}/assemblies/${assemblyId}/votes`, {
        assembly_id: assemblyId,
        agenda_item_id: agendaItemId ? parseInt(agendaItemId) : null,
        option,
        notes: notes || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", assemblyId] });
      queryClient.invalidateQueries({ queryKey: ["vote-summary", assemblyId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Error al votar");
    },
  });

  if (!user) return null;

  return (
    <div style={{
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: 20,
    }}>
      <h3 style={{ marginTop: 0 }}>Votacion Digital</h3>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        >
          {voteOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Tema ID (opcional)"
          value={agendaItemId}
          onChange={(e) => setAgendaItemId(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <input
          type="text"
          placeholder="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ padding: 8, border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
        />
        <button
          onClick={() => voteMutation.mutate()}
          disabled={voteMutation.isPending}
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
          {voteMutation.isPending ? "Votando..." : "Votar"}
        </button>
      </div>
    </div>
  );
}
