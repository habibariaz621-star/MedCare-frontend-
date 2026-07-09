'use client';

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/types';

const dashboardByRole: Record<UserRole, string> = {
  Admin: '/admin',
  Doctor: '/doctor',
  Patient: '/patient',
};

const bookByRole: Record<UserRole, string> = {
  Admin: '/admin',
  Doctor: '/doctor/schedule',
  Patient: '/patient/book',
};

function useLandingAuth() {
  const { user, isAuthenticated, hydrated } = useAppSelector((state) => state.auth);
  const loggedIn = hydrated && isAuthenticated && Boolean(user);
  return { user, hydrated, loggedIn };
}

export function LandingNav() {
  const { user, hydrated, loggedIn } = useLandingAuth();

  if (!hydrated) {
    return (
      <nav className="flex items-center gap-3">
        <span className="text-sm text-slate-400">Loading...</span>
      </nav>
    );
  }

  if (loggedIn && user) {
    return (
      <nav className="flex items-center gap-4 sm:gap-5 pl-2 sm:pl-4 border-l border-violet-200/60 dark:border-violet-800/50">
        <span className="text-sm text-slate-600 dark:text-violet-300 hidden sm:inline px-1">
          Hi, {user.name.split(' ')[0]}
        </span>
        <Link href={dashboardByRole[user.role]} className="btn-primary text-sm px-5 py-2.5">
          Go to Dashboard
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4 sm:gap-5 pl-2 sm:pl-4 border-l border-violet-200/60 dark:border-violet-800/50">
      <Link
        href="/login"
        className="text-sm font-medium text-slate-600 dark:text-violet-200 hover:text-violet-600 transition-colors px-2 py-2"
      >
        Sign In
      </Link>
      <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
        Register
      </Link>
    </nav>
  );
}

export function LandingHeroActions() {
  const { user, hydrated, loggedIn } = useLandingAuth();

  if (!hydrated) return null;

  if (loggedIn && user) {
    const bookHref = bookByRole[user.role];
    const dashboardHref = dashboardByRole[user.role];
    const bookLabel =
      user.role === 'Patient'
        ? 'Book an Appointment'
        : user.role === 'Doctor'
          ? 'View My Schedule'
          : 'Open Dashboard';

    return (
      <div className="animate-fade-up stagger-3 mt-8 flex flex-col sm:flex-row gap-4">
        <Link href={bookHref} className="btn-primary px-6 py-3 animate-pulse-glow">
          {bookLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href={dashboardHref} className="btn-secondary px-6 py-3">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up stagger-3 mt-8 flex flex-col sm:flex-row gap-5 sm:gap-6">
      <Link href="/register" className="btn-primary px-6 py-3 animate-pulse-glow">
        Book an Appointment
        <ArrowRight className="w-4 h-4" />
      </Link>
      <Link href="/login" className="btn-secondary px-6 py-3">
        Sign In
      </Link>
    </div>
  );
}

export function LandingBottomCTA() {
  const { user, hydrated, loggedIn } = useLandingAuth();

  if (!hydrated) return null;

  if (loggedIn && user) {
    const href = bookByRole[user.role];
    const label =
      user.role === 'Patient'
        ? 'Schedule Your Visit'
        : user.role === 'Doctor'
          ? 'View Schedule'
          : 'Open Dashboard';

    return (
      <Link href={href} className="btn-primary mt-8 inline-flex px-6 py-3">
        <Calendar className="w-4 h-4" />
        {label}
      </Link>
    );
  }

  return (
    <Link href="/register" className="btn-primary mt-8 inline-flex px-6 py-3">
      <Calendar className="w-4 h-4" />
      Schedule Your Visit
    </Link>
  );
}

export default LandingNav;
