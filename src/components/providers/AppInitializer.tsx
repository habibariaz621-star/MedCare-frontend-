'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateTheme } from '@/store/slices/themeSlice';
import { setProfile } from '@/store/slices/profileSlice';
import {
  fetchAdminDashboard,
  fetchDoctorDashboard,
  fetchPatientDashboard,
} from '@/store/thunks/dashboard';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, hydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateTheme());
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return;

    if (user.role === 'Patient') {
      dispatch(setProfile(user));
      dispatch(fetchPatientDashboard());
    } else if (user.role === 'Doctor') {
      dispatch(fetchDoctorDashboard());
    } else if (user.role === 'Admin') {
      dispatch(fetchAdminDashboard());
    }
  }, [hydrated, isAuthenticated, user, dispatch]);

  return <>{children}</>;
}
