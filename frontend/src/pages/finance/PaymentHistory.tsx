import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Payment } from "../../types";
import DataTable from "../../components/common/DataTable";
import Input from "../../components/common/Input";

const API_BASE = "/api/finance";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  verified: "#22c55e",
  rejected: "#ef4444",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  verified: "Verificado",
  rejected: "Rechazado",
};

export default function PaymentHistory() {
  const [invoiceId, setInvoiceId] = useState("");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["finance", "payments", invoiceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (invoiceId) params.set("invoice_id", invoiceId);
      const { data } = await axios.get(`${API_BASE}/payments`, { params });
      return data as Payment[];
    },
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Historial de Pagos</h1>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Input type="number" placeholder="Invoice ID (filtro)" value={invoiceId} onChange={setInvoiceId} style={{ width: 240 }} />
      </div>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "uuid", label: "UUID" },
            { key: "invoice_id", label: "Invoice ID" },
            { key: "amount", label: "Valor" },
            { key: "payment_method", label: "Metodo" },
            { key: "reference_number", label: "Referencia" },
            { key: "payment_date", label: "Fecha" },
            { key: "status", label: "Estado" },
          ]}
          data={payments?.map((p) => ({
            ...p,
            uuid: `${p.uuid.slice(0, 8)}...`,
            amount: Number(p.amount).toLocaleString(),
            payment_method: p.payment_method || "--",
            reference_number: p.reference_number || "--",
            status: statusLabels[p.status] || p.status,
          })) || []}
          emptyMessage="No hay pagos"
        />
      )}
    </div>
  );
}
