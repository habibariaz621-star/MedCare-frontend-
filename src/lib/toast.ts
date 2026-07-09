import { store } from '@/store';
import { addNotification } from '@/store/slices/notificationSlice';
import type { Notification } from '@/types';

type NotifyType = Notification['type'];

export function notify(type: NotifyType, message: string) {
  store.dispatch(addNotification({ type, message }));
}

export const toast = {
  success: (message: string) => notify('success', message),
  error: (message: string) => notify('error', message),
  info: (message: string) => notify('info', message),
  warning: (message: string) => notify('warning', message),
};
