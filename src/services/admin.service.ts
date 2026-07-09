import api from './api';
import { mockAdmin } from './mockAdmin';
import type { DashboardStats } from '@/types';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const adminService = {
  async getDashboardStats() {
    if (useMockAuth) return mockAdmin.getDashboardStats();
    const response = await api.get<DashboardStats>('/admin/dashboard');
    return response.data;
  },

  async getDoctors(params?: { search?: string; department?: string; page?: number; limit?: number }) {
    if (useMockAuth) return mockAdmin.getDoctors(params);
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  },

  async createDoctor(data: {
    name: string;
    email: string;
    department: string;
    specialization?: string;
    password?: string;
  }) {
    if (useMockAuth) return mockAdmin.createDoctor(data);
    const response = await api.post('/admin/doctors', data);
    return response.data;
  },

  async updateDoctor(id: string, data: Record<string, string>) {
    const response = await api.patch(`/admin/doctors/${id}`, data);
    return response.data;
  },

  async deleteDoctor(id: string) {
    if (useMockAuth) return mockAdmin.deleteDoctor(id);
    const response = await api.delete(`/admin/doctors/${id}`);
    return response.data;
  },

  async promotePatientToDoctor(email: string) {
    if (useMockAuth) return mockAdmin.promotePatientToDoctor(email);
    const response = await api.post('/admin/doctors/promote-patient', { email });
    return response.data;
  },

  async setDoctorVerification(id: string, adminApproved: boolean) {
    if (useMockAuth) return mockAdmin.setDoctorVerification(id, adminApproved);
    const response = await api.patch(`/admin/doctors/${id}/verification`, { adminApproved });
    return response.data;
  },

  async getDepartments(params?: { search?: string; page?: number; limit?: number }) {
    if (useMockAuth) return mockAdmin.getDepartments(params);
    const response = await api.get('/admin/departments', { params });
    return response.data;
  },

  async createDepartment(data: { name: string; description?: string; headDoctor?: string }) {
    if (useMockAuth) return mockAdmin.createDepartment(data);
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  async updateDepartment(id: string, data: Record<string, string>) {
    const response = await api.patch(`/admin/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: string) {
    if (useMockAuth) return mockAdmin.deleteDepartment(id);
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },

  async getReports() {
    if (useMockAuth) return mockAdmin.getReports();
    const response = await api.get('/admin/reports');
    return response.data;
  },
};
