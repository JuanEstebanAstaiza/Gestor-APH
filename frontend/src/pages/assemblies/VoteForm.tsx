import { useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const API_BASE = "/api/assemblies";

const VOTE_OPTIONS = [
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
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Votacion Digital</h3>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Select value={option} onChange={setOption} options={VOTE_OPTIONS} />
        <Input type="number" placeholder="Tema ID (opcional)" value={agendaItemId} onChange={setAgendaItemId} style={{ width: 160 }} />
        <Input type="text" placeholder="Notas (opcional)" value={notes} onChange={setNotes} style={{ width: 200 }} />
        <Button variant="primary" disabled={voteMutation.isPending} onClick={() => voteMutation.mutate()}>
          {voteMutation.isPending ? "Votando..." : "Votar"}
        </Button>
      </div>
    </div>
  );
}
