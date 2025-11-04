import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface Toast {
  id: string;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string) => {
      const id = createId();
      setToasts((prev) => [...prev, { id, message }]);
      if (typeof window !== 'undefined') {
        window.setTimeout(() => dismiss(id), 2000);
      }
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      push,
      dismiss
    }),
    [dismiss, push, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('toast context missing');
  }
  return context;
};

export const ToastStack: React.FC = () => {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className="rounded bg-slate-800/80 px-4 py-2 text-sm shadow-lg backdrop-blur hover:bg-slate-700"
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
};
