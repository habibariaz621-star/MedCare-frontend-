import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '@/services/admin.service';
import { appointmentService } from '@/services/appointment.service';
import { doctorService } from '@/services/doctor.service';
import type { RootState } from '../index';
import type { Appointment } from '@/types';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdmin',
  async () => adminService.getDashboardStats()
);

export const fetchAnalytics = createAsyncThunk('dashboard/fetchAnalytics', async () =>
  adminService.getReports()
);

export const fetchPatientDashboard = createAsyncThunk(
  'dashboard/fetchPatient',
  async (_, { getState }) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    const res = await appointmentService.getMyAppointments(user.id, { limit: 100 });
    const items: Appointment[] = res.data ?? [];
    return {
      upcoming: items.filter((a) => a.status === 'Approved').length,
      pending: items.filter((a) => a.status === 'Pending').length,
      completed: items.filter((a) => a.status === 'Completed').length,
      recent: items.slice(0, 5),
    };
  }
);

export const fetchDoctorDashboard = createAsyncThunk(
  'dashboard/fetchDoctor',
  async (_, { getState }) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    const res = await doctorService.getSchedule(user.id, { limit: 100 });
    const items: Appointment[] = res.data ?? [];
    const today = todayStr();
    return {
      today: items.filter((a) => a.date === today).length,
      pending: items.filter((a) => a.status === 'Pending').length,
      upcoming: items.filter((a) => a.date > today && a.status === 'Approved').length,
    };
  }
);
