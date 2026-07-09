'use client';

import RouteGuard from '@/components/guards/RouteGuard';
import DashboardLayout from '@/components/common/DashboardLayout';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['Patient']}>
      <DashboardLayout role="Patient">{children}</DashboardLayout>
    </RouteGuard>
  );
}
