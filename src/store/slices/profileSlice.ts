import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, MedicalRecord } from '@/types';
import {
  fetchPatientProfile,
  updatePatientProfile,
  fetchMedicalHistory,
} from '../thunks/profile';

interface ProfileState {
  profile: User | null;
  medicalRecords: MedicalRecord[];
  medicalTotalPages: number;
  medicalCurrentPage: number;
  loading: boolean;
  saving: boolean;
}

const initialState: ProfileState = {
  profile: null,
  medicalRecords: [],
  medicalTotalPages: 1,
  medicalCurrentPage: 1,
  loading: false,
  saving: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
    },
    setMedicalRecords: (state, action: PayloadAction<MedicalRecord[]>) => {
      state.medicalRecords = action.payload;
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.medicalRecords = [];
      state.medicalTotalPages = 1;
      state.medicalCurrentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updatePatientProfile.pending, (state) => {
        state.saving = true;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.rejected, (state) => {
        state.saving = false;
      })
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalRecords = action.payload.data ?? [];
        state.medicalTotalPages = action.payload.totalPages ?? 1;
        state.medicalCurrentPage = action.payload.currentPage ?? 1;
      })
      .addCase(fetchMedicalHistory.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setProfile, setMedicalRecords, setProfileLoading, clearProfile } =
  profileSlice.actions;
export default profileSlice.reducer;
