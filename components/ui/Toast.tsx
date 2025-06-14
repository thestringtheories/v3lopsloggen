// components/ui/Toast.tsx
"use client";

import React, { useEffect } from 'react';
import type { ToastMessage, ToastType } from './ToastProvider';
import { useTranslations } from 'next-intl';

// SVG Icons for Toast types
const CheckCircleIcon = ({ className = "w-6 h-6" }: {className?: string}): React.JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className = "w-6 h-6" }: {className?: string}): React.JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className = "w-6 h-6" }: {className?: string}): React.JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const InformationCircleIcon = ({ className = "w-6 h-6" }: {className?: string}): React.JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const XMarkIcon = ({ className = "w-5 h-5" }: {className?: string}): React.JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; text: string; iconBorder?: string, iconItself?: string }> = {
  success: { bg: 'bg-green-500', text: 'text-white', iconItself: 'text-white' },
  error: { bg: 'bg-red-500', text: 'text-white', iconItself: 'text-white' },
  warning: { bg: 'bg-amber-500', text: 'text-white', iconItself: 'text-white' },
  info: { bg: 'bg-sky-500', text: 'text-white', iconItself: 'text-white' },
  blank: { bg: 'hidden', text: '', iconItself: ''}, // Will be hidden by ToastProvider
};

const ToastIcons: Record<Exclude<ToastType, 'blank'>, React.JSX.Element> = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  warning: <ExclamationTriangleIcon />,
  info: <InformationCircleIcon />,
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, message, type } = toast;
  const t = useTranslations('Toast');

  useEffect(() => {
    if (type === 'blank') { // Immediately dismiss if type is blank (used for replacing toasts)
        onDismiss(id);
    }
  }, [type, id, onDismiss]);

  if (type === 'blank') return null; // Don't render anything if it's a 'blank' toast to be removed


  const styles = toastStyles[type];
  const Icon = ToastIcons[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`relative flex items-center p-4 pr-10 rounded-lg shadow-2xl ${styles.bg} ${styles.text} animate-fadeInRight`}
    >
      <div className={`flex-shrink-0 w-6 h-6 mr-3 ${styles.iconItself}`}>
        {Icon}
      </div>
      <p className="text-sm font-medium flex-grow">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label={t('close')}
        className={`absolute top-1/2 right-2.5 -translate-y-1/2 p-1 rounded-full ${styles.text} opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-opacity`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      <style jsx global>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;