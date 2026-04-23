import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { type Invoice, type InvoiceCreate } from "../../types";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

const API_BASE = "/api/finance";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  sent: "Enviada",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Cancelada",
};

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

  const isConsejo = user && parseInt(user.role) >= 3;

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "sent", label: "Enviada" },
    { value: "paid", label: "Pagada" },
    { value: "overdue", label: "Vencida" },
    { value: "cancelled", label: "Cancelada" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Cuentas de Cobro</h1>
        {isConsejo && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nueva Factura"}
          </Button>
        )}
      </div>

      {showForm && isConsejo && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Nueva Factura</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Input type="number" placeholder="Resident ID" value={String(form.resident_id)} onChange={(v) => setForm({ ...form, resident_id: parseInt(v) || 0 })} />
            <Input type="number" placeholder="Asset ID" value={String(form.asset_id)} onChange={(v) => setForm({ ...form, asset_id: parseInt(v) || 0 })} />
            <Input type="month" value={form.period} onChange={(v) => setForm({ ...form, period: v })} />
            <Input type="text" placeholder="Valor" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
            <Input type="date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} />
            <Button variant="primary" disabled={createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Creando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <Input type="month" placeholder="Period" value={period} onChange={setPeriod} style={{ width: 160 }} />
        <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} style={{ width: 160 }} />
        <Input type="number" placeholder="Resident ID" value={residentId} onChange={setResidentId} style={{ width: 160 }} />
        <Button variant="secondary" disabled={generateMutation.isPending || !period} onClick={() => generateMutation.mutate(period || "")}>
          {generateMutation.isPending ? "Generando..." : "Generar Facturas"}
        </Button>
      </div>

      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "uuid", label: "UUID" },
            { key: "period", label: "Periodo" },
            { key: "amount", label: "Valor" },
            { key: "status", label: "Estado" },
            { key: "due_date", label: "Fecha Venc." },
            { key: "paid_at", label: "Pagada" },
          ]}
          data={invoices?.map((inv) => ({
            ...inv,
            uuid: `${inv.uuid.slice(0, 8)}...`,
            amount: Number(inv.amount).toLocaleString(),
            status: statusLabels[inv.status] || inv.status,
          })) || []}
          emptyMessage="No hay facturas"
        />
      )}
    </div>
  );
}
