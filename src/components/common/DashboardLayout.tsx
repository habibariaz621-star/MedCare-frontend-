'use client';

import { useState } from 'react';
import Sidebar, { MobileMenuButton } from '@/components/common/Sidebar';
import DashboardSettingsMenu from '@/components/common/DashboardSettingsMenu';
import AppointmentReminders from '@/components/common/AppointmentReminders';
import type { UserRole } from '@/types';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

interface DashboardLayoutProps {
  role: UserRole;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex dashboard-bg dashboard-shell">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main flex flex-col">
        <header className="sticky top-0 z-30 glass-card border-b border-violet-200/50 dark:border-violet-900/40 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <span className="font-semibold text-gradient truncate lg:text-base">{CLINIC_SHORT_NAME}</span>
          </div>
          <DashboardSettingsMenu role={role} />
        </header>
        <main className="flex-1 overflow-auto page-enter">
          <div className="dashboard-content px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {(role === 'Patient' || role === 'Doctor') && <AppointmentReminders />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
