'use client';

import RouteGuard from '@/components/guards/RouteGuard';
import DashboardLayout from '@/components/common/DashboardLayout';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['Doctor']}>
      <DashboardLayout role="Doctor">{children}</DashboardLayout>
    </RouteGuard>
  );
}
