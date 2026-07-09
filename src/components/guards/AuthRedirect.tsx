'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/types';

const dashboardByRole: Record<UserRole, string> = {
  Admin: '/admin',
  Doctor: '/doctor',
  Patient: '/patient',
};

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return;
    router.replace(dashboardByRole[user.role]);
  }, [hydrated, isAuthenticated, user, router]);

  return <>{children}</>;
}
