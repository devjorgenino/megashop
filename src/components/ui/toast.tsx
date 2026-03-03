"use client";

/**
 * Sistema de notificaciones (toasts) accesible.
 * Usa Zustand para el estado. Las notificaciones se anuncian automáticamente
 * a lectores de pantalla vía role="alert" y aria-live.
 *
 * Uso:
 *   import { useToast } from "@/components/ui/toast";
 *   const { addToast } = useToast();
 *   addToast({ type: "success", message: "Producto agregado" });
 */
import { create } from "zustand";
import { useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

let toastCounter = 0;

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// ── Icons ────────────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const TOAST_ICON_STYLES: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
};

// ── Component ────────────────────────────────────────────────────────────────

export function ToastContainer() {
  const toasts = useToast((state) => state.toasts);
  const removeToast = useToast((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-in",
              TOAST_STYLES[toast.type]
            )}
          >
            <Icon
              className={cn("h-5 w-5 flex-shrink-0 mt-0.5", TOAST_ICON_STYLES[toast.type])}
              aria-hidden="true"
            />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
