import { useState } from "react";
import axios from "axios";

const API_BASE = "/api/finance";

export default function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(`${API_BASE}/import`, formData);
      setResult(JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setResult(err.response?.data?.detail || "Error en importacion");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Importar Datos Contables</h1>

      <div style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: 24,
      }}>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
          Importar estados de cartera y pagos desde sistemas contables externos (CSV, Excel).
        </p>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 16 }}
        />

        {file && (
          <p style={{ marginBottom: 12 }}>
            Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        <button
          onClick={handleImport}
          disabled={importing || !file}
          style={{
            background: importing || !file ? "#9ca3af" : "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "10px 24px",
            cursor: importing || !file ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {importing ? "Importando..." : "Importar"}
        </button>
      </div>

      {result && (
        <div style={{
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 16,
          marginTop: 24,
          fontFamily: "monospace",
          fontSize: 13,
          whiteSpace: "pre-wrap",
        }}>
          {result}
        </div>
      )}
    </div>
  );
}
