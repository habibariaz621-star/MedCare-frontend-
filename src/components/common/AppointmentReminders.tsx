'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setReminders, dismissReminder } from '@/store/slices/notificationSlice';
import { fetchAppointments } from '@/store/thunks/appointments';
import { Bell, X } from 'lucide-react';
import type { Appointment } from '@/types';

function getUpcomingReminders(appointments: Appointment[]) {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return appointments
    .filter((a) => a.status === 'Approved' || a.status === 'Pending')
    .filter((a) => {
      const apptDate = new Date(`${a.date}T12:00:00`);
      return apptDate >= now && apptDate <= in48h;
    })
    .map((a) => ({
      id: `reminder-${a._id}`,
      appointmentId: a._id,
      message: `Reminder: Appointment on ${new Date(a.date).toLocaleDateString()} at ${a.timeSlot}`,
      date: a.date,
      timeSlot: a.timeSlot,
      dismissed: false,
    }));
}

export default function AppointmentReminders() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const reminders = useAppSelector((state) =>
    state.notifications.reminders.filter((r) => !r.dismissed)
  );
  const appointments = useAppSelector((state) => state.appointments.items);

  useEffect(() => {
    if (!user || (user.role !== 'Patient' && user.role !== 'Doctor')) return;

    dispatch(fetchAppointments()).then((result) => {
      if (fetchAppointments.fulfilled.match(result)) {
        const items: Appointment[] = result.payload.data ?? [];
        dispatch(setReminders(getUpcomingReminders(items)));
      }
    });

    const interval = setInterval(() => {
      dispatch(fetchAppointments());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, user?.id, user?.role]);

  useEffect(() => {
    if (appointments.length > 0) {
      dispatch(setReminders(getUpcomingReminders(appointments)));
    }
  }, [appointments, dispatch]);

  if (!user || reminders.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 animate-fade-in"
        >
          <Bell className="w-4 h-4 text-violet-600 shrink-0" />
          <p className="text-sm text-violet-900 dark:text-violet-100 flex-1">{reminder.message}</p>
          <button
            onClick={() => dispatch(dismissReminder(reminder.id))}
            className="text-violet-500 hover:text-violet-700"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
