import api from './api';
import { mockDoctors } from './mockDoctors';
import { mockAppointments } from './mockAppointments';
import { consultationFeeService } from './consultationFee.service';
import type { Doctor, DoctorProfileForm } from '@/types';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const doctorService = {
  async getSchedule(
    doctorUserId: string,
    params?: { search?: string; status?: string; page?: number; limit?: number }
  ) {
    if (useMockAuth) return mockAppointments.getDoctorSchedule(doctorUserId, params);
    const response = await api.get('/doctor/appointments', { params });
    return response.data;
  },

  async updateAppointmentStatus(appointmentId: string, status: 'Approved' | 'Rejected') {
    if (useMockAuth) return mockAppointments.updateAppointmentStatus(appointmentId, status);
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  async completeAppointment(appointmentId: string) {
    if (useMockAuth) return mockAppointments.completeAppointment(appointmentId);
    const response = await api.patch(`/appointments/${appointmentId}/complete`);
    return response.data;
  },

  async cancelAppointment(appointmentId: string, cancellationReason?: string) {
    if (useMockAuth) return mockAppointments.cancelAppointment(appointmentId, cancellationReason);
    const response = await api.patch(`/appointments/${appointmentId}/cancel`, {
      cancellationReason,
    });
    return response.data;
  },

  async getPatientVisitHistory(doctorUserId: string, patientId: string) {
    if (useMockAuth) return mockAppointments.getPatientVisitHistory(doctorUserId, patientId);
    const response = await api.get(`/doctor/patients/${patientId}/appointments`);
    return response.data;
  },

  async getPatients(
    doctorUserId: string,
    params?: { search?: string; page?: number; limit?: number }
  ) {
    if (useMockAuth) return mockAppointments.getDoctorPatients(doctorUserId, params);
    const response = await api.get('/doctor/patients', { params });
    return response.data;
  },

  async addConsultationNote(
    doctorUserId: string,
    patientId: string,
    data: { diagnosis: string; prescription?: string; notes?: string }
  ) {
    if (useMockAuth) return mockAppointments.addConsultationNote(doctorUserId, patientId, data);
    const response = await api.post(`/doctor/patients/${patientId}/notes`, data);
    return response.data;
  },

  async getPatientRecords(doctorUserId: string, patientId: string) {
    if (useMockAuth) return mockAppointments.getPatientRecords(doctorUserId, patientId);
    const response = await api.get(`/doctor/patients/${patientId}/records`);
    return response.data;
  },

  async getProfile(userId: string, fallback?: { name: string; email: string }) {
    if (useMockAuth) {
      if (fallback) return mockDoctors.getOrCreateProfile(userId, fallback.name, fallback.email);
      const profile = mockDoctors.getProfileByUserId(userId);
      if (!profile) throw { response: { data: { message: 'Doctor profile not found.' } } };
      return profile;
    }
    const response = await api.get<Doctor>('/doctor/profile');
    return consultationFeeService.mergeIntoDoctor(response.data);
  },

  async updateProfile(userId: string, data: DoctorProfileForm) {
    if (useMockAuth) return mockDoctors.updateProfile(userId, data);

    const { consultationFee, ...profilePayload } = data;
    const response = await api.patch<Doctor>('/doctor/profile', profilePayload);

    if (response.data._id) {
      await consultationFeeService.setFee(response.data._id, consultationFee);
    }

    return consultationFeeService.mergeIntoDoctor({
      ...response.data,
      consultationFee,
    });
  },
};
