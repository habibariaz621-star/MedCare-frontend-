import { createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '@/services/appointment.service';
import { doctorService } from '@/services/doctor.service';
import type { RootState } from '../index';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetch',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    const { search, status, page, limit } = state.appointments.filters;
    if (!user) throw new Error('Not authenticated');

    if (user.role === 'Patient') {
      return appointmentService.getMyAppointments(user.id, { search, status, page, limit });
    }
    if (user.role === 'Doctor') {
      return doctorService.getSchedule(user.id, { search, status, page, limit });
    }
    throw new Error('Appointments not available for this role');
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (
    data: { doctorId: string; date: string; timeSlot: string; reason?: string },
    { getState }
  ) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    return appointmentService.createAppointment(user.id, user.name, user.email, data);
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (appointmentId: string) => {
    await appointmentService.cancelAppointment(appointmentId);
    return appointmentId;
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/reschedule',
  async ({ id, date, timeSlot }: { id: string; date: string; timeSlot: string }) => {
    const updated = await appointmentService.rescheduleAppointment(id, { date, timeSlot });
    return updated;
  }
);

export const doctorCancelAppointment = createAsyncThunk(
  'appointments/doctorCancel',
  async (
    { id, cancellationReason }: { id: string; cancellationReason?: string },
    { getState }
  ) => {
    const user = (getState() as RootState).auth.user;
    if (!user || user.role !== 'Doctor') throw new Error('Only doctors can cancel from schedule');
    const updated = await doctorService.cancelAppointment(id, cancellationReason);
    return updated;
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) => {
    const updated = await doctorService.updateAppointmentStatus(id, status);
    return updated;
  }
);

export const completeAppointment = createAsyncThunk(
  'appointments/complete',
  async (id: string) => {
    const updated = await doctorService.completeAppointment(id);
    return updated;
  }
);
