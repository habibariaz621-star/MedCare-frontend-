'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Menu, X } from 'lucide-react';
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

function NavLinks({
  loggedIn,
  user,
  onNavigate,
  className = '',
}: {
  loggedIn: boolean;
  user: ReturnType<typeof useLandingAuth>['user'];
  onNavigate?: () => void;
  className?: string;
}) {
  if (loggedIn && user) {
    return (
      <div className={className}>
        <span className="text-sm text-slate-600 dark:text-violet-300 px-1 md:px-0">
          Hi, {user.name.split(' ')[0]}
        </span>
        <Link
          href={dashboardByRole[user.role]}
          className="btn-primary text-sm px-5 py-2.5 w-full md:w-auto justify-center"
          onClick={onNavigate}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <Link
        href="/login"
        className="text-sm font-medium text-slate-600 dark:text-violet-200 hover:text-violet-600 transition-colors px-2 py-2 text-center md:text-left"
        onClick={onNavigate}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="btn-primary text-sm px-5 py-2.5 w-full md:w-auto justify-center"
        onClick={onNavigate}
      >
        Register
      </Link>
    </div>
  );
}

export function LandingNav() {
  const { user, hydrated, loggedIn } = useLandingAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  if (!hydrated) {
    return (
      <nav className="flex items-center gap-3">
        <span className="text-sm text-slate-400 sr-only">Loading</span>
      </nav>
    );
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="relative flex items-center">
      <div className="hidden md:flex items-center gap-4 lg:gap-5 pl-4 border-l border-violet-200/60 dark:border-violet-800/50">
        <NavLinks loggedIn={loggedIn} user={user} className="flex items-center gap-4 lg:gap-5" />
      </div>

      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-violet-200/80 dark:border-violet-700/50 bg-white/80 dark:bg-violet-950/40 text-violet-700 dark:text-violet-200"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 z-30 bg-slate-900/20 dark:bg-black/40"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="md:hidden absolute right-0 top-full mt-2 z-40 w-52 rounded-xl border border-violet-200/70 dark:border-violet-800/60 glass-card shadow-xl shadow-violet-900/10 p-3">
            <NavLinks
              loggedIn={loggedIn}
              user={user}
              onNavigate={closeMenu}
              className="flex flex-col gap-2"
            />
          </div>
        </>
      )}
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
