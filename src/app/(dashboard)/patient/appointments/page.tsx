'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAppointmentsRedux } from '@/hooks/useAppointmentsRedux';
import { cancelAppointment, rescheduleAppointment } from '@/store/thunks/appointments';
import Pagination from '@/components/common/Pagination';
import { Search, Calendar, XCircle, RefreshCw, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import type { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
  const dispatch = useAppDispatch();
  const { appointments, totalPages, currentPage, loading, filters, setSearch, setStatus, setPage, reload } =
    useAppointmentsRedux();
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', timeSlot: '10:00 AM' });

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await dispatch(cancelAppointment(id)).unwrap();
      toast.success('Appointment cancelled');
      reload();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleId) return;
    try {
      await dispatch(
        rescheduleAppointment({ id: rescheduleId, date: rescheduleForm.date, timeSlot: rescheduleForm.timeSlot })
      ).unwrap();
      toast.success('Appointment rescheduled');
      setRescheduleId(null);
      reload();
    } catch {
      toast.error('Failed to reschedule');
    }
  };

  const getDoctorName = (appt: Appointment) => {
    if (typeof appt.doctorId === 'object' && appt.doctorId) {
      return (appt.doctorId as { name: string }).name;
    }
    return 'Doctor';
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Heart className="w-4 h-4" />
          Patient
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">View Appointment History</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Redux state — search, filter, pagination, cancel &amp; reschedule.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 dashboard-panel p-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
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
          <option value="Completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-slate-500">No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="dashboard-panel rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Dr. {getDoctorName(appt)}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(appt.date).toLocaleDateString()} · {appt.timeSlot}
                </div>
                <span className="inline-block mt-2 text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300">
                  {appt.status}
                </span>
                {appt.cancellationReason && (
                  <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-2">
                    Cancellation note: {appt.cancellationReason}
                  </p>
                )}
              </div>
              {appt.status === 'Completed' && (
                <Link
                  href="/patient/feedback"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <Star className="w-4 h-4" />
                  Leave feedback
                </Link>
              )}
              {['Pending', 'Approved'].includes(appt.status) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setRescheduleId(appt._id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />

      {rescheduleId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleReschedule}
            className="glass-card rounded-xl p-6 w-full max-w-md space-y-3"
          >
            <h3 className="font-bold text-lg">Reschedule Appointment</h3>
            <div>
              <label className="text-sm font-medium">New Date</label>
              <input
                type="date"
                required
                value={rescheduleForm.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                className="w-full mt-1 input-theme px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Time Slot</label>
              <input
                required
                value={rescheduleForm.timeSlot}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, timeSlot: e.target.value })}
                className="w-full mt-1 input-theme px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setRescheduleId(null)} className="flex-1 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
