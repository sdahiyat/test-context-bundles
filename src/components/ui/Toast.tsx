'use client';

import React from 'react';
import { useToast, ToastType } from '@/contexts/ToastContext';

const toastStyles: Record<ToastType, { border: string; bg: string; text: string; icon: string }> = {
  success: {
    border: 'border-l-green-500',
    bg: 'bg-white',
    text: 'text-gray-800',
    icon: '✓',
  },
  error: {
    border: 'border-l-red-500',
    bg: 'bg-white',
    text: 'text-gray-800',
    icon: '✕',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-white',
    text: 'text-gray-800',
    icon: 'ℹ',
  },
  warning: {
    border: 'border-l-yellow-500',
    bg: 'bg-white',
    text: 'text-gray-800',
    icon: '⚠',
  },
};

const iconColors: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-20 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2 sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0"
    >
      {toasts.map((toast) => {
        const styles = toastStyles[toast.type];
        const iconColor = iconColors[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-lg border border-l-4 ${styles.border} ${styles.bg} p-4 shadow-lg sm:w-80`}
          >
            <span className={`mt-0.5 text-sm font-bold ${iconColor}`}>{styles.icon}</span>
            <p className={`flex-1 text-sm ${styles.text}`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="ml-auto shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
