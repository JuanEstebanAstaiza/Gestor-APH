import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import FileUpload from "../../components/common/FileUpload";

export default function DocumentUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      if (description) formData.append("description", description);
      return api.post("/api/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      window.location.href = "/documents";
    },
    onError: () => setError("Error al subir"),
  });

  const handleUpload = async (file: File) => {
    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }
    setError("");
    mutation.mutate(file);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Subir documento</h1>
      {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: 8, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Título</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Descripción</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 8 }} />
      </div>
      <FileUpload onUpload={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" />
    </div>
  );
}
