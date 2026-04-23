import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import FileUpload from "../../components/common/FileUpload";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";

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
      setError("El titulo es requerido");
      return;
    }
    setError("");
    mutation.mutate(file);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Subir documento</h1>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Titulo</label>
        <Input value={title} onChange={setTitle} required />
      </div>
      <div className="form-group">
        <label className="form-label">Descripcion</label>
        <Textarea value={description} onChange={setDescription} />
      </div>
      <FileUpload onUpload={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" />
    </div>
  );
}
