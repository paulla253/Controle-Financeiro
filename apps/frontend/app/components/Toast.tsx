'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleX } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toast: Omit<ToastMessage, 'id'>) => void;
let nextId = 1;
const listeners: Set<Listener> = new Set();

export const toast = {
  success: (message: string) => dispatch({ message, type: 'success' }),
  error: (message: string) => dispatch({ message, type: 'error' }),
  info: (message: string) => dispatch({ message, type: 'info' }),
};

function dispatch(payload: Omit<ToastMessage, 'id'>) {
  listeners.forEach((fn) => fn(payload));
}

const bgClass: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const listener: Listener = (payload) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, ...payload }]);
      timers.current.set(
        id,
        setTimeout(() => remove(id), 4000),
      );
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  function remove(id: number) {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${bgClass[t.type]}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            aria-label="Fechar notificação"
            className="ml-2 text-red-300 hover:text-red-100"
          >
            <CircleX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
