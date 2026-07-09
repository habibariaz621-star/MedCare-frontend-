import api from './api';
import { mockReviews } from './mockReviews';
import type { PaginatedResponse, Review } from '@/types';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const reviewService = {
  async submitReview(
    appointmentId: string,
    data: { rating: number; comment?: string },
    mockMeta?: {
      doctorId?: string;
      doctorName?: string;
      appointmentDate?: string;
      appointmentTimeSlot?: string;
    },
  ) {
    if (useMockAuth) {
      const userId =
        typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('user') || '{}')?.id ?? 'patient-1'
          : 'patient-1';
      return mockReviews.submitReview(userId, appointmentId, data, mockMeta);
    }
    const response = await api.post<Review>(`/appointments/${appointmentId}/review`, data);
    return response.data;
  },

  async getMyReviews(params?: { page?: number; limit?: number }) {
    if (useMockAuth) {
      const userId =
        typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('user') || '{}')?.id ?? 'patient-1'
          : 'patient-1';
      return mockReviews.getPatientReviews(userId, params);
    }
    const response = await api.get<PaginatedResponse<Review>>('/patient/reviews', { params });
    return response.data;
  },

  async getReviewedAppointmentIds() {
    if (useMockAuth) {
      const userId =
        typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('user') || '{}')?.id ?? 'patient-1'
          : 'patient-1';
      return mockReviews.getReviewedAppointmentIds(userId);
    }
    const response = await api.get<string[]>('/patient/reviewed-appointment-ids');
    return response.data;
  },
};
