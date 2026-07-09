'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAppointmentFilters } from '@/store/slices/appointmentSlice';
import { fetchAppointments } from '@/store/thunks/appointments';

export function useAppointmentsRedux() {
  const dispatch = useAppDispatch();
  const { items, totalPages, currentPage, loading, filters } = useAppSelector(
    (state) => state.appointments
  );

  const load = useCallback(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const setSearch = (search: string) => {
    dispatch(setAppointmentFilters({ search, page: 1 }));
  };

  const setStatus = (status: string) => {
    dispatch(setAppointmentFilters({ status, page: 1 }));
  };

  const setPage = (page: number) => {
    dispatch(setAppointmentFilters({ page }));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [filters.search, filters.status, filters.page, filters.limit, load]);

  return {
    appointments: items,
    totalPages,
    currentPage,
    loading,
    filters,
    setSearch,
    setStatus,
    setPage,
    reload: load,
  };
}
