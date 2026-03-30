import React, { useState, useCallback } from 'react';
import { CheckCircleIcon, InfoIcon, ExclamationCircleIcon, XIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type ShowToastFn = (message: string, type?: ToastType) => void;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
};

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
  error: <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />,
  info: <InfoIcon className="w-5 h-5 text-brand-400 flex-shrink-0" />,
};

const BORDER_MAP: Record<ToastType, string> = {
  success: 'border-emerald-500/40',
  error: 'border-red-500/40',
  info: 'border-brand-500/40',
};

export const ToastContainer: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm bg-slate-900/90 shadow-xl pointer-events-auto ${BORDER_MAP[toast.type]}`}
          style={{ animation: 'slideInRight 0.25s ease-out' }}
        >
          {ICON_MAP[toast.type]}
          <p className="flex-1 text-sm text-slate-200 leading-snug">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
