'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAppointmentsRedux } from '@/hooks/useAppointmentsRedux';
import { doctorCancelAppointment, updateAppointmentStatus, completeAppointment } from '@/store/thunks/appointments';
import { doctorService } from '@/services/doctor.service';
import Pagination from '@/components/common/Pagination';
import { Check, X, Calendar, Clock, Search, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { Appointment } from '@/types';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function ScheduleContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { appointments, totalPages, currentPage, loading, filters, setSearch, setStatus, setPage } =
    useAppointmentsRedux();
  const initialStatus = searchParams.get('status') ?? '';
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Emergency — doctor unavailable');

  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus, setStatus]);

  useEffect(() => {
    if (!authUser?.id) return;
    doctorService
      .getProfile(authUser.id, { name: authUser.name, email: authUser.email })
      .then((p) => setProfileComplete(Boolean(p.profileComplete)))
      .catch(() => setProfileComplete(false));
  }, [authUser]);

  const today = todayStr();
  const dailyAppointments = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today]
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.date > today),
    [appointments, today]
  );

  const handleStatusUpdate = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    setActionLoading(id);
    try {
      await dispatch(updateAppointmentStatus({ id, status: newStatus })).unwrap();
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await dispatch(completeAppointment(id)).unwrap();
      toast.success('Visit marked as completed — patient can leave feedback');
    } catch {
      toast.error('Could not mark visit as completed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmergencyCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    setActionLoading(cancelTarget._id);
    try {
      await dispatch(
        doctorCancelAppointment({
          id: cancelTarget._id,
          cancellationReason: cancelReason.trim() || 'Emergency cancellation',
        })
      ).unwrap();
      toast.success('Appointment cancelled. Patient will be notified.');
      setCancelTarget(null);
      setCancelReason('Emergency — doctor unavailable');
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const getPatient = (appt: Appointment) => {
    if (typeof appt.patientId === 'object' && appt.patientId) {
      return appt.patientId as { name: string; email: string };
    }
    return { name: 'Unknown', email: '' };
  };

  const renderAppointmentCard = (appt: Appointment) => {
    const patient = getPatient(appt);
    const canEmergencyCancel = appt.status === 'Approved' || appt.status === 'Pending';

    return (
      <div
        key={appt._id}
        className="dashboard-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{patient.name}</p>
          <p className="text-xs text-slate-500">{patient.email}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(appt.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {appt.timeSlot}
            </span>
          </div>
          {appt.reason && <p className="text-xs text-slate-500 mt-1">Reason: {appt.reason}</p>}
          {appt.cancellationReason && (
            <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-1">
              Cancelled: {appt.cancellationReason}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              appt.status === 'Approved'
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                : appt.status === 'Rejected'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                : appt.status === 'Cancelled'
                ? 'bg-violet-100/60 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {appt.status}
          </span>
          {appt.status === 'Pending' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => handleStatusUpdate(appt._id, 'Approved')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold btn-primary disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                {actionLoading === appt._id ? 'Approving...' : 'Approve'}
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-white/80 dark:bg-violet-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-60"
              >
                <X className="w-4 h-4" />
                {actionLoading === appt._id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}
          {appt.status === 'Approved' && (
            <button
              type="button"
              disabled={actionLoading !== null}
              onClick={() => handleMarkComplete(appt._id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-violet-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {actionLoading === appt._id ? 'Completing...' : 'Mark complete'}
            </button>
          )}
          {canEmergencyCancel && (
            <button
              type="button"
              disabled={actionLoading !== null}
              onClick={() => setCancelTarget(appt)}
              className="btn-emergency-outline px-3 py-1.5 text-sm disabled:opacity-60"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily & Upcoming Schedule</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Approve requests, manage your day, or cancel approved visits in an emergency.
        </p>
      </div>

      {!profileComplete && (
        <Link
          href="/doctor/profile"
          className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4 hover:border-amber-300 transition-colors"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Complete your doctor profile</p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-1">
              Add your specialization so patients can book appointments with you.
            </p>
          </div>
        </Link>
      )}

      <div className="flex flex-col md:flex-row gap-3 dashboard-panel p-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full pl-9 pr-3 py-2 input-theme text-sm bg-transparent"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-theme px-3 py-2 text-sm bg-transparent"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading schedule...</div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Today&apos;s Schedule</h2>
              {dailyAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-violet-300/60 glass-card rounded-xl p-6 text-center">
                  No appointments today.
                </p>
              ) : (
                <div className="space-y-3">{dailyAppointments.map(renderAppointmentCard)}</div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-violet-300/60 glass-card rounded-xl p-6 text-center">
                  No upcoming appointments.
                </p>
              ) : (
                <div className="space-y-3">{upcomingAppointments.map(renderAppointmentCard)}</div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">All Appointments</h2>
            {appointments.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-slate-500 dark:text-violet-300/60">
                No appointments in your schedule.
              </div>
            ) : (
              <div className="space-y-3">{appointments.map(renderAppointmentCard)}</div>
            )}
            <div className="mt-4">
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleEmergencyCancel}
            className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 animate-fade-up"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-300/40 dark:border-fuchsia-700/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Emergency cancellation</h3>
                <p className="text-sm text-slate-600 dark:text-violet-200/70 mt-1">
                  Cancel {getPatient(cancelTarget).name}&apos;s appointment on{' '}
                  <span className="font-medium text-violet-700 dark:text-violet-300">
                    {new Date(cancelTarget.date).toLocaleDateString()} · {cancelTarget.timeSlot}
                  </span>
                  ?
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-violet-100">
                Reason for cancellation
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-theme w-full mt-1.5 px-3 py-2 text-sm"
                placeholder="e.g. Emergency surgery, personal emergency..."
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="flex-1 btn-secondary py-2.5 text-sm"
              >
                Keep Appointment
              </button>
              <button
                type="submit"
                disabled={actionLoading === cancelTarget._id}
                className="flex-1 btn-emergency py-2.5 text-sm"
              >
                {actionLoading === cancelTarget._id ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function DoctorSchedulePage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading schedule...</p>}>
      <ScheduleContent />
    </Suspense>
  );
}
