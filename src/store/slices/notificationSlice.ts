import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  message: string;
  date: string;
  timeSlot: string;
  dismissed: boolean;
}

interface NotificationState {
  items: Notification[];
  reminders: AppointmentReminder[];
}

const initialState: NotificationState = {
  items: [],
  reminders: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'> & { id?: string }>
    ) => {
      state.items.push({
        id: action.payload.id ?? crypto.randomUUID(),
        type: action.payload.type,
        message: action.payload.message,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
    setReminders: (state, action: PayloadAction<AppointmentReminder[]>) => {
      state.reminders = action.payload;
    },
    dismissReminder: (state, action: PayloadAction<string>) => {
      const reminder = state.reminders.find((r) => r.id === action.payload);
      if (reminder) reminder.dismissed = true;
    },
    clearReminders: (state) => {
      state.reminders = [];
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  setReminders,
  dismissReminder,
  clearReminders,
} = notificationSlice.actions;
export default notificationSlice.reducer;
