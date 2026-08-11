"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "success" | "error";

type ToastState = {
  message: string;
  kind: ToastKind;
} | null;

type EditToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const EditToastContext = createContext<EditToastContextValue | null>(null);

export function EditToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    setToast({ message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <EditToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-36 left-1/2 z-[70] max-w-sm -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg md:bottom-20 ${
            toast.kind === "error"
              ? "border border-red-300 bg-red-50 text-red-800"
              : "border border-brass/30 bg-charcoal text-bone"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </EditToastContext.Provider>
  );
}

export function useEditToast(): EditToastContextValue {
  const context = useContext(EditToastContext);
  if (!context) {
    return { showToast: () => undefined };
  }
  return context;
}
