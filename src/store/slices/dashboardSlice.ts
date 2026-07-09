import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Appointment, DashboardStats } from '@/types';
import {
  fetchAdminDashboard,
  fetchDoctorDashboard,
  fetchPatientDashboard,
  fetchAnalytics,
} from '../thunks/dashboard';

interface PatientDashboardStats {
  upcoming: number;
  pending: number;
  completed: number;
  recent: Appointment[];
}

interface DoctorDashboardStats {
  today: number;
  pending: number;
  upcoming: number;
}

interface AnalyticsData {
  appointmentsByMonth?: { month: string; count: number }[];
  patientsByDepartment?: { department: string; count: number }[];
  summary?: {
    growthRate: number;
    avgAppointmentsPerDay: number;
    topDepartment: string;
  };
}

interface DashboardState {
  admin: DashboardStats | null;
  patient: PatientDashboardStats | null;
  doctor: DoctorDashboardStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  admin: null,
  patient: null,
  doctor: null,
  analytics: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.admin = null;
      state.patient = null;
      state.doctor = null;
      state.analytics = null;
      state.loading = false;
      state.error = null;
    },
    setAnalytics: (state, action: PayloadAction<AnalyticsData | null>) => {
      state.analytics = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load admin dashboard';
      })
      .addCase(fetchPatientDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(fetchPatientDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load patient dashboard';
      })
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load doctor dashboard';
      })
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearDashboard, setAnalytics } = dashboardSlice.actions;
export default dashboardSlice.reducer;
