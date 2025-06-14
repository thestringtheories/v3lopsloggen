// components/ui/ToastProvider.tsx
"use client";

import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import Toast from './Toast'; // We'll create this next

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'blank';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, options?: { duration?: number; id?: string }) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType, options: { duration?: number; id?: string } = {}): string => {
    const id = options.id || Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? (type === 'success' || type === 'info' ? 3000 : 5000); // Default duration
    
    setToasts((prevToasts: ToastMessage[]) => {
      // If an ID is provided and a toast with that ID exists, update it. Otherwise, add new.
      const existingToastIndex = prevToasts.findIndex(toast => toast.id === id);
      if (existingToastIndex > -1) {
        const updatedToasts = [...prevToasts];
        // If type is blank, it's a signal to remove, handle in Toast component or here by filtering
        if(type === 'blank') {
            return updatedToasts.filter(toast => toast.id !== id);
        }
        updatedToasts[existingToastIndex] = { id, message, type, duration };
        return updatedToasts;
      }
      return [...prevToasts, { id, message, type, duration }];
    });

    if (type !== 'blank' && duration > 0) { // Don't auto-remove if duration is 0 or negative
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts: ToastMessage[]) => prevToasts.filter((toast: ToastMessage) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
        {toasts.map((toast: ToastMessage) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};