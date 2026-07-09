import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Appointment } from '@/types';
import {
  fetchAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  doctorCancelAppointment,
  completeAppointment,
} from '../thunks/appointments';

interface AppointmentFilters {
  search: string;
  status: string;
  page: number;
  limit: number;
}

interface AppointmentState {
  items: Appointment[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  booking: boolean;
  filters: AppointmentFilters;
}

const initialState: AppointmentState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  booking: false,
  filters: {
    search: '',
    status: '',
    page: 1,
    limit: 10,
  },
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (
      state,
      action: PayloadAction<{ items: Appointment[]; totalPages: number; currentPage: number }>
    ) => {
      state.items = action.payload.items;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    },
    setAppointmentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAppointmentFilters: (state, action: PayloadAction<Partial<AppointmentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateAppointmentInList: (state, action: PayloadAction<Appointment>) => {
      const index = state.items.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
    },
    clearAppointments: (state) => {
      state.items = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.totalPages = action.payload.totalPages ?? 1;
        state.currentPage = action.payload.currentPage ?? 1;
      })
      .addCase(fetchAppointments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.booking = true;
      })
      .addCase(bookAppointment.fulfilled, (state) => {
        state.booking = false;
      })
      .addCase(bookAppointment.rejected, (state) => {
        state.booking = false;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a._id === action.payload);
        if (index !== -1) state.items[index] = { ...state.items[index], status: 'Cancelled' };
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const updated = action.payload as Appointment;
        const index = state.items.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const updated = action.payload as Appointment;
        const index = state.items.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(doctorCancelAppointment.fulfilled, (state, action) => {
        const updated = action.payload as Appointment;
        const index = state.items.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        const updated = action.payload as Appointment;
        const index = state.items.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.items[index] = updated;
      });
  },
});

export const {
  setAppointments,
  setAppointmentLoading,
  setAppointmentFilters,
  updateAppointmentInList,
  clearAppointments,
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
