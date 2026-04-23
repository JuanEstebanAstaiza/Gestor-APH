import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Reservation } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const API_BASE = "/api/reservations";

const areaTypeLabels: Record<string, string> = {
  bbq: "Parrilla",
  salon: "Salon",
  cancha: "Cancha",
  piscina: "Piscina",
  otros: "Otros",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
  completed: "#3b82f6",
};

const ASSET_OPTIONS = [
  { value: "", label: "Todas las areas" },
  { value: "bbq", label: "Parrilla" },
  { value: "salon", label: "Salon" },
  { value: "cancha", label: "Cancha" },
  { value: "piscina", label: "Piscina" },
  { value: "otros", label: "Otros" },
];

export default function CalendarView() {
  const [assetId, setAssetId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 7));

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", "calendar", assetId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (assetId) params.set("asset_id", assetId);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      const { data } = await axios.get(`${API_BASE}/reservations/calendar`, { params });
      return data as Reservation[];
    },
    enabled: !!startDate && !!endDate,
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const days = (() => {
    const [year, month] = viewDate.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const totalDays = getDaysInMonth(year, month);
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let d = 1; d <= totalDays; d++) result.push(d);
    return result;
  })();

  const getReservationsForDay = (day: number) => {
    if (!reservations) return [];
    const dateStr = `${viewDate}-${String(day).padStart(2, "0")}`;
    return reservations.filter((r) => r.start_datetime && r.start_datetime.startsWith(dateStr));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Calendario de Reservas</h1>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <Input type="date" placeholder="Desde" value={startDate} onChange={setStartDate} style={{ width: 160 }} />
        <Input type="date" placeholder="Hasta" value={endDate} onChange={setEndDate} style={{ width: 160 }} />
        <Select value={assetId} onChange={setAssetId} options={ASSET_OPTIONS} style={{ width: 160 }} />
        <Button variant="primary" disabled={!startDate || !endDate} onClick={() => setViewDate(startDate || new Date().toISOString().slice(0, 7))}>
          Ver Calendario
        </Button>
      </div>
      {startDate && endDate && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Button variant="secondary" size="sm" onClick={() => { const [y, m] = viewDate.split("-").map(Number); setViewDate(`${y}-${String(m - 1).padStart(2, "0")}`); }}>
              ← Anterior
            </Button>
            <h2 style={{ margin: 0 }}>
              {new Date(viewDate + "-01").toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
            </h2>
            <Button variant="secondary" size="sm" onClick={() => { const [y, m] = viewDate.split("-").map(Number); setViewDate(`${y}-${String(m + 1).padStart(2, "0")}`); }}>
              Siguiente →
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div key={d} style={{ textAlign: "center", padding: 8, fontWeight: 600, fontSize: 12, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayReservations = day ? getReservationsForDay(day) : [];
              return (
                <div key={i} style={{ minHeight: 80, padding: 8, border: "1px solid var(--color-border)", background: day ? "var(--color-bg)" : "transparent", fontSize: 12 }}>
                  {day && (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{day}</div>
                      {dayReservations.slice(0, 2).map((r) => (
                        <div key={r.id} style={{ padding: "2px 6px", borderRadius: 3, background: statusColors[r.status] || "#6b7280", color: "white", fontSize: 10, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {areaTypeLabels[r.area_type] || r.area_type} — {r.status}
                        </div>
                      ))}
                      {dayReservations.length > 2 && (
                        <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                          +{dayReservations.length - 2} más
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!startDate || !endDate ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
          Seleccione un rango de fechas para ver el calendario
        </p>
      ) : isLoading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "area_name", label: "Area" },
            { key: "start_datetime", label: "Desde" },
            { key: "end_datetime", label: "Hasta" },
            { key: "guests_count", label: "Invitados" },
            { key: "status", label: "Estado" },
          ]}
          data={reservations?.map((r) => ({
            ...r,
            area_name: `${areaTypeLabels[r.area_type] || r.area_type} — ${r.area_name}`,
            status: (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: statusColors[r.status] || "#6b7280", color: "white", fontSize: 12, fontWeight: 600 }}>
                {r.status}
              </span>
            ),
          })) || []}
          emptyMessage="No hay reservas en este rango"
        />
      )}
    </div>
  );
}
