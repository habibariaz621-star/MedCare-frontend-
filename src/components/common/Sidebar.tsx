'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { clearAppointments } from '@/store/slices/appointmentSlice';
import { clearProfile } from '@/store/slices/profileSlice';
import { clearDashboard } from '@/store/slices/dashboardSlice';
import { clearNotifications, clearReminders } from '@/store/slices/notificationSlice';
import {
  SquareTerminal,
  Calendar,
  Users,
  FileText,
  Layers,
  LogOut,
  UserCircle,
  BarChart3,
  ClipboardList,
  Moon,
  Sun,
  X,
  Menu,
  Sparkles,
  Home,
  MessageSquare,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

interface SidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}

const links: Record<UserRole, { name: string; href: string; icon: typeof Calendar }[]> = {
  Admin: [
    { name: 'Dashboard', href: '/admin', icon: SquareTerminal },
    { name: 'Doctors', href: '/admin/doctors', icon: Users },
    { name: 'Departments', href: '/admin/departments', icon: Layers },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ],
  Doctor: [
    { name: 'Dashboard', href: '/doctor', icon: SquareTerminal },
    { name: 'Schedule', href: '/doctor/schedule', icon: Calendar },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Profile', href: '/doctor/profile', icon: UserCircle },
  ],
  Patient: [
    { name: 'Dashboard', href: '/patient', icon: SquareTerminal },
    { name: 'Book Visit', href: '/patient/book', icon: Calendar },
    { name: 'Appointments', href: '/patient/appointments', icon: ClipboardList },
    { name: 'Medical History', href: '/patient/history', icon: FileText },
    { name: 'Feedback', href: '/patient/feedback', icon: MessageSquare },
    { name: 'Profile', href: '/patient/profile', icon: UserCircle },
  ],
};

const roleLabels: Record<UserRole, string> = {
  Admin: 'Admin',
  Doctor: 'Doctor',
  Patient: 'Patient',
};

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAppSelector((state) => state.theme.mode);

  const handleLogout = () => {
    dispatch(clearAppointments());
    dispatch(clearProfile());
    dispatch(clearDashboard());
    dispatch(clearNotifications());
    dispatch(clearReminders());
    dispatch(logout());
    router.push('/login');
  };

  const activeLinks = links[role] ?? [];

  const navContent = (
    <>
      <div className="px-1 pb-3 border-b border-violet-800/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{CLINIC_SHORT_NAME}</h2>
            <span className="text-[10px] font-medium uppercase tracking-wide text-violet-300/70">
              {roleLabels[role]}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-3 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5">
        {activeLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30'
                  : 'text-violet-100/85 hover:bg-violet-900/45 hover:text-white'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-violet-300'}`} />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-violet-800/40 pt-3 mt-3 space-y-0.5 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-violet-100/80 hover:bg-violet-900/40 hover:text-white font-medium transition-colors"
        >
          <Home className="w-[18px] h-[18px] text-violet-300 shrink-0" />
          <span>Home</span>
        </Link>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-violet-100/80 hover:bg-violet-900/40 hover:text-white font-medium transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-amber-300 shrink-0" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-violet-300 shrink-0" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 font-medium transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        style={{ width: 'var(--sidebar-width)' }}
        className={`sidebar-gradient fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 shrink-0 text-white h-screen h-dvh flex flex-col px-3 py-4 shadow-2xl shadow-violet-950/50 transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-3 text-violet-300 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl border border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-violet-600 dark:text-violet-400" />
    </button>
  );
}
