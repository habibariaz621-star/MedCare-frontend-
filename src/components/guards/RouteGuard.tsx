'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/types';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      const redirectMap: Record<UserRole, string> = {
        Admin: '/admin',
        Doctor: '/doctor',
        Patient: '/patient',
      };
      router.replace(redirectMap[user.role]);
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-fuchsia-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-violet-300/70 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
