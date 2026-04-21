import { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ onUpload, accept, maxSizeMB = 10 }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo no puede superar ${maxSizeMB}MB`);
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => fileRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: "var(--radius)",
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? "var(--color-primary-light)" : "var(--color-bg-secondary)",
        transition: "all 0.2s",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <div style={{ color: "var(--color-primary)" }}>Subiendo...</div>
      ) : (
        <div>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
          <div style={{ color: "var(--color-text-muted)" }}>
            Arrastra un archivo o haz clic para seleccionar
          </div>
          {accept && <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
            Acepta: {accept}
          </div>}
        </div>
      )}
    </div>
  );
}
