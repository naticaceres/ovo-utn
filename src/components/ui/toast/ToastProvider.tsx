import React from 'react';

import styles from './toast.module.css';
import type { Toast, ToastVariant } from './ToastContext';
import { ToastContext } from './ToastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback(
    (message: string, options?: { variant?: ToastVariant; ttl?: number }) => {
      if (!message) return;
      const variant = options?.variant || 'info';
      const ttl = options?.ttl ?? 5000;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts(prev => [...prev, { id, message, variant, ttl }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, ttl);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={styles.container}
        aria-live='assertive'
        aria-relevant='additions removals'
      >
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.variant]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
