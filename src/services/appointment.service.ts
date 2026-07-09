import api from './api';
import { mockDoctors } from './mockDoctors';
import { mockAppointments } from './mockAppointments';
import { consultationFeeService } from './consultationFee.service';
import type { PaginatedResponse, Doctor } from '@/types';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function mergeFeesIntoResponse(
  response: PaginatedResponse<Doctor>
): Promise<PaginatedResponse<Doctor>> {
  return {
    ...response,
    data: await consultationFeeService.mergeIntoDoctors(response.data ?? []),
  };
}

async function fetchPublicDoctors(params: {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Doctor>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.department) query.set('department', params.department);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const url = `${API_BASE}/doctors${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      return { data: [], totalPages: 1, currentPage: 1, total: 0 };
    }
    const data = (await response.json()) as PaginatedResponse<Doctor>;
    return mergeFeesIntoResponse(data);
  } catch {
    return { data: [], totalPages: 1, currentPage: 1, total: 0 };
  }
}

export const appointmentService = {
  async getDoctors(params: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) {
    if (useMockAuth) return mockDoctors.getDoctors(params);
    const response = await api.get<PaginatedResponse<Doctor>>('/doctors', { params });
    return mergeFeesIntoResponse(response.data);
  },

  /** Public doctor list for landing page — no login required */
  async getPublicDoctors(params: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) {
    if (useMockAuth) return mockDoctors.getDoctors(params);
    return fetchPublicDoctors(params);
  },

  async createAppointment(
    patientUserId: string,
    patientName: string,
    patientEmail: string,
    appointmentData: {
      doctorId: string;
      date: string;
      timeSlot: string;
      reason?: string;
    }
  ) {
    if (useMockAuth) {
      return mockAppointments.createAppointment(
        patientUserId,
        patientName,
        patientEmail,
        appointmentData
      );
    }
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  async getMyAppointments(
    patientUserId: string,
    params?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    if (useMockAuth) return mockAppointments.getPatientAppointments(patientUserId, params);
    const response = await api.get('/appointments/my', { params });
    return response.data;
  },

  async cancelAppointment(id: string) {
    if (useMockAuth) return mockAppointments.cancelAppointment(id);
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  async rescheduleAppointment(id: string, data: { date: string; timeSlot: string }) {
    if (useMockAuth) return mockAppointments.rescheduleAppointment(id, data);
    const response = await api.patch(`/appointments/${id}/reschedule`, data);
    return response.data;
  },
};
