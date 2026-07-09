'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { bookAppointment } from '@/store/thunks/appointments';
import { appointmentService } from '@/services/appointment.service';
import Pagination from '@/components/common/Pagination';
import { Search, Filter, CalendarCheck, Clock, Heart, Banknote, Briefcase } from 'lucide-react';
import { toast } from '@/lib/toast';
import { generateTimeSlots, formatOfficeHours } from '@/lib/timeSlots';
import { formatConsultationFee } from '@/lib/formatFee';
import { formatExperienceYears } from '@/lib/formatExperience';
import type { Doctor } from '@/types';

export default function BookAppointmentPage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const booking = useAppSelector((state) => state.appointments.booking);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor?.officeStartTime || !selectedDoctor?.officeEndTime) return [];
    return generateTimeSlots(selectedDoctor.officeStartTime, selectedDoctor.officeEndTime);
  }, [selectedDoctor]);

  useEffect(() => {
    if (availableSlots.length > 0) {
      setTimeSlot(availableSlots[0]);
    } else {
      setTimeSlot('');
    }
  }, [availableSlots]);

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate('');
    setReason('');
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await appointmentService.getDoctors({
          search,
          department,
          page,
          limit: 6,
        });
        setDoctors(response.data ?? []);
        setTotalPages(response.totalPages ?? 1);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchDoctors, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, department, page]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !timeSlot || !authUser) return;
    setSubmitting(true);
    try {
      await dispatch(
        bookAppointment({
          doctorId: selectedDoctor._id,
          date: bookingDate,
          timeSlot,
          reason,
        })
      ).unwrap();
      toast.success('Appointment booked successfully!');
      setSelectedDoctor(null);
      setBookingDate('');
      setReason('');
    } catch {
      toast.error('Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Heart className="w-4 h-4" />
          Patient
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Book Appointments</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Search specialists by department and schedule your clinical visit online.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-theme w-full pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="input-theme p-2 text-sm"
          >
            <option value="">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No doctors found.</p>
          <p className="text-sm mt-2 text-violet-500/80">
            Doctors must complete their profile before appearing here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="glass-card rounded-xl p-5 card-hover flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-600 px-2.5 py-1 rounded-full uppercase">
                  {doctor.department}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                  Dr. {doctor.name}
                </h3>
                {doctor.specialization && (
                  <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mt-1">
                    {doctor.specialization}
                  </p>
                )}
                {doctor.qualification && (
                  <p className="text-xs text-slate-500 dark:text-violet-300/60 mt-1">
                    {doctor.qualification}
                  </p>
                )}
                {doctor.experienceYears != null && doctor.experienceYears > 0 && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-violet-300/70 mt-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {formatExperienceYears(doctor.experienceYears)}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 mt-2">
                  <Banknote className="w-3.5 h-3.5" />
                  Checkup: {formatConsultationFee(doctor.consultationFee)}
                </p>
                <p className="text-sm text-slate-500 dark:text-violet-300/70 mt-2">
                  Days: {doctor.availability?.join(', ') || 'Mon - Fri'}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  Office: {formatOfficeHours(doctor.officeStartTime, doctor.officeEndTime)}
                </p>
              </div>
              <button
                onClick={() => openBooking(doctor)}
                className="mt-5 w-full btn-primary py-2 text-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                Select Slot
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl max-w-md w-full p-6 animate-fade-up">
            <h3 className="text-lg font-bold">Book with Dr. {selectedDoctor.name}</h3>
            <p className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 mt-1">
              <Clock className="w-4 h-4" />
              Office hours: {formatOfficeHours(selectedDoctor.officeStartTime, selectedDoctor.officeEndTime)}
            </p>
            <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="input-theme w-full p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Slot</label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots available for this doctor&apos;s office hours.</p>
                ) : (
                  <select
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="input-theme w-full p-2 text-sm"
                  >
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="input-theme w-full p-2 text-sm"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 btn-secondary py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !timeSlot}
                  className="flex-1 btn-primary py-2 text-sm disabled:opacity-60"
                >
                  {submitting ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
