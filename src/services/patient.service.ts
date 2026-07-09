import api from './api';
import { mockAuth } from './mockAuth';
import { mockAppointments } from './mockAppointments';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const patientService = {
  async getProfile(patientUserId: string) {
    if (useMockAuth) return mockAuth.getProfile(patientUserId);
    const response = await api.get('/patient/profile');
    return response.data;
  },

  async updateProfile(
    patientUserId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: string;
      avatarUrl?: string;
    }
  ) {
    if (useMockAuth) return mockAuth.updateProfile(patientUserId, data);
    const response = await api.patch('/patient/profile', data);
    return response.data;
  },

  async getMedicalHistory(
    patientUserId: string,
    params?: { search?: string; page?: number; limit?: number }
  ) {
    if (useMockAuth) return mockAppointments.getPatientMedicalHistory(patientUserId, params);
    const response = await api.get('/patient/medical-records', { params });
    return response.data;
  },
};
