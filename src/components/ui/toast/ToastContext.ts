import React from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  ttl: number; // ms
}

export interface ToastContextValue {
  showToast: (
    message: string,
    options?: { variant?: ToastVariant; ttl?: number }
  ) => void;
}

export const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);
