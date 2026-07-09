'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeNotification } from '@/store/slices/notificationSlice';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const AUTH_PATHS = ['/login', '/register'];

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  info: 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
};

function ToastItem({ id, type, message }: { id: string; type: keyof typeof icons; message: string }) {
  const dispatch = useAppDispatch();
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeNotification(id)), 4000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg shadow-violet-500/10 ${styles[type]}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => dispatch(removeNotification(id))}
        className="shrink-0 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const pathname = usePathname();
  const notifications = useAppSelector((state) => state.notifications.items);

  if (AUTH_PATHS.includes(pathname) || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <ToastItem key={n.id} id={n.id} type={n.type} message={n.message} />
      ))}
    </div>
  );
}
