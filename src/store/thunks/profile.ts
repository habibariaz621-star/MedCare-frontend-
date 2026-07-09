import { createAsyncThunk } from '@reduxjs/toolkit';
import { patientService } from '@/services/patient.service';
import type { RootState } from '../index';

export const fetchPatientProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { getState }) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    return patientService.getProfile(user.id);
  }
);

export const updatePatientProfile = createAsyncThunk(
  'profile/update',
  async (
    data: { name?: string; phone?: string; address?: string; dateOfBirth?: string; avatarUrl?: string },
    { getState }
  ) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    return patientService.updateProfile(user.id, data);
  }
);

export const fetchMedicalHistory = createAsyncThunk(
  'profile/fetchMedicalHistory',
  async (params: { search?: string; page?: number; limit?: number } | undefined, { getState }) => {
    const user = (getState() as RootState).auth.user;
    if (!user) throw new Error('Not authenticated');
    return patientService.getMedicalHistory(user.id, params);
  }
);
