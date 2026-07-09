'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPatientDashboard } from '@/store/thunks/dashboard';
import StatsCard from '@/components/common/StatsCard';
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Heart,
  MessageSquare,
} from 'lucide-react';

const patientFeatures = [
  {
    title: 'Book Appointments',
    description: 'Search doctors by department and schedule a visit online.',
    href: '/patient/book',
    icon: Calendar,
    color: 'from-violet-600 to-violet-700',
  },
  {
    title: 'Cancel or Reschedule',
    description: 'Manage pending and approved appointments — change date or cancel.',
    href: '/patient/appointments',
    icon: Clock,
    color: 'from-fuchsia-600 to-fuchsia-700',
  },
  {
    title: 'Appointment History',
    description: 'View all past and upcoming appointments with status.',
    href: '/patient/appointments',
    icon: CheckCircle,
    color: 'from-purple-600 to-purple-700',
  },
  {
    title: 'Medical History',
    description: 'View diagnosis records, prescriptions, and doctor notes.',
    href: '/patient/history',
    icon: FileText,
    color: 'from-teal-600 to-teal-700',
  },
  {
    title: 'Visit Feedback',
    description: 'Rate completed appointments and share your experience.',
    href: '/patient/feedback',
    icon: MessageSquare,
    color: 'from-amber-600 to-orange-600',
  },
];

export default function PatientDashboard() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { patient, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchPatientDashboard());
  }, [dispatch]);

  const stats = patient ?? { upcoming: 0, pending: 0, completed: 0, recent: [] };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Heart className="w-4 h-4" />
          Patient
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Welcome back, {authUser?.name?.split(' ')[0] ?? 'Patient'}
        </h1>
        <p className="text-slate-600 dark:text-violet-200/60 mt-1">
          Manage your appointments, medical history, and profile.
        </p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Upcoming" value={stats.upcoming} icon={Calendar} color="violet" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
          <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patient Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientFeatures.map(({ title, description, href, icon: Icon, color }) => (
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
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Appointments</h2>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments yet.</p>
        ) : (
          <ul className="space-y-3">
            {stats.recent.map((appt) => (
              <li key={appt._id} className="flex justify-between py-2 border-b border-violet-100 dark:border-violet-900/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{new Date(appt.date).toLocaleDateString()} · {appt.timeSlot}</p>
                  <p className="text-xs text-slate-500">{appt.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
