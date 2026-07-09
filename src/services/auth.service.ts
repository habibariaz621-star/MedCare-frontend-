import api from './api';
import { mockAuth } from './mockAuth';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const authService = {
  async login(credentials: { email: string; password: string; role?: string }) {
    if (useMockAuth) return mockAuth.login(credentials);
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    if (useMockAuth) return mockAuth.register(userData);
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async verifyEmail(email: string, otp: string) {
    if (useMockAuth) return mockAuth.verifyEmail(email, otp);
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  async resendOtp(email: string) {
    if (useMockAuth) return mockAuth.resendOtp(email);
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  async forgotPassword(email: string) {
    if (useMockAuth) return mockAuth.forgotPassword(email);
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string }) {
    if (useMockAuth) return mockAuth.resetPassword(data);
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async getProfile() {
    if (useMockAuth) {
      throw new Error('Mock profile is loaded from auth state.');
    }
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async deactivateAccount() {
    if (useMockAuth) return mockAuth.deactivateAccount();
    const response = await api.patch('/auth/deactivate-account');
    return response.data;
  },

  isMockMode: () => useMockAuth,
};
