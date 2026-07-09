'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDoctorDashboard } from '@/store/thunks/dashboard';
import { Calendar, Users, FileText, ArrowRight, Stethoscope, Clock } from 'lucide-react';

const doctorFeatures = [
  {
    title: 'Daily & Upcoming Schedule',
    description: 'View today’s appointments and all upcoming visits in your calendar.',
    href: '/doctor/schedule',
    icon: Calendar,
    color: 'from-violet-600 to-violet-700',
  },
  {
    title: 'Appointment Requests',
    description: 'Accept or reject pending booking requests from patients.',
    href: '/doctor/schedule?status=Pending',
    icon: Clock,
    color: 'from-fuchsia-600 to-fuchsia-700',
  },
  {
    title: 'Patient Information',
    description: 'View patient details from your approved appointments.',
    href: '/doctor/patients',
    icon: Users,
    color: 'from-purple-600 to-purple-700',
  },
  {
    title: 'Consultation Notes',
    description: 'Add diagnosis, prescription, and notes after each consultation.',
    href: '/doctor/patients',
    icon: FileText,
    color: 'from-teal-600 to-teal-700',
  },
];

export default function DoctorDashboard() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { doctor, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
  }, [dispatch]);

  const stats = doctor ?? { today: 0, pending: 0, upcoming: 0 };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Stethoscope className="w-4 h-4" />
          Doctor
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Welcome back, Dr. {authUser?.name?.split(' ').slice(-1)[0] ?? 'Doctor'}
        </h1>
        <p className="text-slate-600 dark:text-violet-200/60 mt-1">
          Manage your schedule, patients, and professional profile.
        </p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-sm text-slate-500 dark:text-violet-300/60">Today&apos;s Appointments</p>
            <p className="text-3xl font-bold text-gradient mt-1">{stats.today}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-sm text-slate-500 dark:text-violet-300/60">Pending Requests</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-sm text-slate-500 dark:text-violet-300/60">Upcoming Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.upcoming}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Doctor Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {doctorFeatures.map(({ title, description, href, icon: Icon, color }) => (
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
    </div>
  );
}
