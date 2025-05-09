// Adapted from shadcn/ui toast component
import { useEffect, useState } from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
};

type ToastState = {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => void;
  removeToast: (id: string) => void;
};

export function useToast(): ToastState {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Auto remove toasts after duration
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 5000);
      return { id: toast.id, timer };
    });

    return () => {
      timers.forEach((t) => clearTimeout(t.timer));
    };
  }, [toasts]);

  return {
    toasts,
    addToast,
    removeToast,
  };
}