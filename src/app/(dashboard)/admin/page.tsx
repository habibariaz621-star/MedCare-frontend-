'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminDashboard } from '@/store/thunks/dashboard';
import StatsCard from '@/components/common/StatsCard';
import { Users, Stethoscope, Calendar, Clock, Layers, BarChart3, ArrowRight, Shield } from 'lucide-react';

const adminFeatures = [
  {
    title: 'Manage Doctors',
    description: 'Add, search, update, and remove clinic doctors and assign departments.',
    href: '/admin/doctors',
    icon: Stethoscope,
    color: 'from-violet-600 to-violet-700',
  },
  {
    title: 'Manage Departments',
    description: 'Create departments, assign heads, and organize clinical units.',
    href: '/admin/departments',
    icon: Layers,
    color: 'from-fuchsia-600 to-fuchsia-700',
  },
  {
    title: 'View Reports',
    description: 'Analytics on appointments, departments, growth, and clinic operations.',
    href: '/admin/reports',
    icon: BarChart3,
    color: 'from-purple-600 to-purple-700',
  },
];

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { admin: stats, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const defaultStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    departments: 0,
  };

  const data = stats ?? defaultStats;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Shield className="w-4 h-4" />
          Administrator
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Administrative Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Dashboard data loaded via Redux Toolkit global state.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading dashboard metrics...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Patients" value={data.totalPatients} icon={Users} color="violet" />
          <StatsCard title="Total Doctors" value={data.totalDoctors} icon={Stethoscope} color="green" />
          <StatsCard title="Appointments" value={data.totalAppointments} icon={Calendar} color="fuchsia" />
          <StatsCard
            title="Pending Requests"
            value={data.pendingAppointments}
            icon={Clock}
            color="amber"
            trend={`${data.completedAppointments} completed`}
          />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Administrator Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {adminFeatures.map(({ title, description, href, icon: Icon, color }) => (
            <Link key={title} href={href} className="glass-card rounded-2xl p-5 card-hover group flex flex-col">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-violet-200/60 mt-2 flex-1 leading-relaxed">{description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 mt-4 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 card-hover">
        <h2 className="font-semibold text-slate-900 dark:text-white">Clinic Overview</h2>
        <p className="text-3xl font-bold text-gradient mt-2">{data.departments}</p>
        <p className="text-sm text-slate-500 dark:text-violet-300/50 mt-1">Active departments under administration</p>
      </div>
    </div>
  );
}
