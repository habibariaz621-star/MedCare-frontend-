'use client';

import RouteGuard from '@/components/guards/RouteGuard';
import DashboardLayout from '@/components/common/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['Admin']}>
      <DashboardLayout role="Admin">{children}</DashboardLayout>
    </RouteGuard>
  );
}
