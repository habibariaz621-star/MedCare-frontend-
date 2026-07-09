'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAnalytics } from '@/store/thunks/dashboard';
import StatsCard from '@/components/common/StatsCard';
import AnalyticsBarChart from '@/components/common/AnalyticsBarChart';
import { TrendingUp, Users, Calendar } from 'lucide-react';

export default function AdminReportsPage() {
  const dispatch = useAppDispatch();
  const { analytics, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const monthly = analytics?.appointmentsByMonth ?? [];
  const byDept = analytics?.patientsByDepartment ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">View Reports</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Redux analytics — appointment &amp; patient charts with global dashboard state.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading reports...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Growth Rate"
              value={`${analytics?.summary?.growthRate ?? 0}%`}
              icon={TrendingUp}
              color="green"
            />
            <StatsCard
              title="Avg. Appointments/Day"
              value={analytics?.summary?.avgAppointmentsPerDay ?? 0}
              icon={Calendar}
              color="violet"
            />
            <StatsCard
              title="Top Department"
              value={analytics?.summary?.topDepartment ?? 'N/A'}
              icon={Users}
              color="fuchsia"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Appointments by Month"
              data={monthly.map((m) => ({ label: m.month, value: m.count }))}
              colorClass="bg-violet-600"
            />
            <AnalyticsBarChart
              title="Patients by Department"
              data={byDept.map((d) => ({ label: d.department, value: d.count }))}
              colorClass="bg-fuchsia-600"
            />
          </div>
        </>
      )}
    </div>
  );
}
