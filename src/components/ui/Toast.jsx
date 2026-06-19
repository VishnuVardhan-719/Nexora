import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within Toast');
  return ctx;
}

// Global toast instance
let globalShowToast = null;

export function showToast(message, type = 'success') {
  if (globalShowToast) globalShowToast(message, type);
}

export default function Toast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    globalShowToast = show;
    return () => { globalShowToast = null; };
  }, [show]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type} show`}>
      <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} />
      <span>{toast.message}</span>
    </div>
  );
}
