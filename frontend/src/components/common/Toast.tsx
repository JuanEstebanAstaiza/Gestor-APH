import { useState, useEffect } from "react";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "warning" | "info";
}

let nextId = 0;

export const toast = {
  success: (text: string) => add(text, "success"),
  error: (text: string) => add(text, "error"),
  warning: (text: string) => add(text, "warning"),
  info: (text: string) => add(text, "info"),
};

function add(text: string, type: ToastMessage["type"]) {
  const id = ++nextId;
  const msg: ToastMessage = { id, text, type };
  window.__toastManager?.add(msg);
  setTimeout(() => window.__toastManager?.remove(id), 4000);
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

declare global {
  interface Window {
    __toastManager: {
      add: (msg: ToastMessage) => void;
      remove: (id: number) => void;
    } | null;
  }
}
