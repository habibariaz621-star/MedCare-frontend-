'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Settings, UserCircle, UserX } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearAppointments } from '@/store/slices/appointmentSlice';
import { clearProfile } from '@/store/slices/profileSlice';
import { clearDashboard } from '@/store/slices/dashboardSlice';
import { clearNotifications, clearReminders } from '@/store/slices/notificationSlice';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/apiError';
import { toast } from '@/lib/toast';
import { getInitials } from '@/lib/profileImage';

const profilePaths: Partial<Record<UserRole, string>> = {
  Doctor: '/doctor/profile',
  Patient: '/patient/profile',
};

interface DashboardSettingsMenuProps {
  role: UserRole;
}

export default function DashboardSettingsMenu({ role }: DashboardSettingsMenuProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const profileHref = profilePaths[role];
  const [open, setOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      'Deactivate your account? You will be logged out and will not be able to sign in again until an admin restores access.',
    );
    if (!confirmed) return;

    setDeactivating(true);
    try {
      const result = await authService.deactivateAccount();
      toast.success(result.message ?? 'Account deactivated.');
      dispatch(clearAppointments());
      dispatch(clearProfile());
      dispatch(clearDashboard());
      dispatch(clearNotifications());
      dispatch(clearReminders());
      dispatch(logout());
      router.push('/login');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Could not deactivate account.'));
    } finally {
      setDeactivating(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      <div
        className="w-9 h-9 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0 ring-2 ring-violet-300/40 dark:ring-violet-700/50"
        title={user.name}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-xs font-semibold text-violet-700 dark:text-violet-200">
            {getInitials(user.name)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-violet-200/80 dark:border-violet-700/50 bg-white/80 dark:bg-violet-950/40 text-violet-700 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-colors"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-violet-200/70 dark:border-violet-800/60 glass-card shadow-xl shadow-violet-900/10 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-violet-100 dark:border-violet-900/50">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate lowercase">{user.email}</p>
          </div>

          {profileHref && (
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-violet-700 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-950/50"
            >
              <UserCircle className="w-4 h-4" />
              Manage Profile
            </Link>
          )}

          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
          >
            <UserX className="w-4 h-4" />
            {deactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      )}
    </div>
  );
}
