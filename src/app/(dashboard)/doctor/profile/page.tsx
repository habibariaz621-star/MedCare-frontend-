'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { doctorService } from '@/services/doctor.service';
import { DEPARTMENT_OPTIONS, AVAILABILITY_DAYS } from '@/services/mockDoctors';
import ProfileViewCard from '@/components/common/ProfileViewCard';
import ProfileAvatarUpload from '@/components/common/ProfileAvatarUpload';
import DoctorAvailabilityCalendar from '@/components/common/DoctorAvailabilityCalendar';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatOfficeHours } from '@/lib/timeSlots';
import { phoneValidationMessage, sanitizePhoneInput } from '@/lib/phoneInput';
import {
  GraduationCap,
  Stethoscope,
  AlertCircle,
  Clock,
  Phone,
  Banknote,
  Briefcase,
} from 'lucide-react';
import { formatConsultationFee } from '@/lib/formatFee';
import { formatExperienceYears } from '@/lib/formatExperience';
import type { DoctorProfileForm } from '@/types';

const emptyForm: DoctorProfileForm = {
  department: '',
  specialization: '',
  qualification: '',
  experienceYears: undefined,
  phone: '',
  bio: '',
  availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  officeStartTime: '09:00',
  officeEndTime: '17:00',
  avatarUrl: '',
};

export default function DoctorProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DoctorProfileForm>(emptyForm);
  const [profileComplete, setProfileComplete] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = () => {
    if (!authUser?.id) return;
    doctorService
      .getProfile(authUser.id, { name: authUser.name, email: authUser.email })
      .then((data) => {
        setForm({
          department: data.department ?? '',
          specialization: data.specialization ?? '',
          qualification: data.qualification ?? '',
          experienceYears: data.experienceYears,
          consultationFee: data.consultationFee,
          phone: data.phone ?? '',
          bio: data.bio ?? '',
          availability: data.availability ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          officeStartTime: data.officeStartTime ?? '09:00',
          officeEndTime: data.officeEndTime ?? '17:00',
          avatarUrl: data.avatarUrl ?? authUser.avatarUrl ?? '',
        });
        setProfileComplete(Boolean(data.profileComplete));
        setAdminApproved(Boolean(data.adminApproved));
      })
      .catch(() => setForm({ ...emptyForm, avatarUrl: authUser.avatarUrl ?? '' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, [authUser?.id]);

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return;

    const phoneError = phoneValidationMessage(form.phone);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    setSaving(true);
    try {
      const updated = await doctorService.updateProfile(authUser.id, form);
      setProfileComplete(Boolean(updated.profileComplete));
      setAdminApproved(Boolean(updated.adminApproved));
      if (authUser && token) {
        dispatch(
          setCredentials({
            user: {
              ...authUser,
              avatarUrl: form.avatarUrl || authUser.avatarUrl,
              phone: form.phone || authUser.phone,
            },
            token,
          })
        );
      }
      setEditing(false);
      toast.success(
        updated.adminApproved
          ? 'Profile saved! Patients can book appointments with you.'
          : updated.profileComplete
            ? 'Profile saved. Waiting for admin verification before patients can book.'
            : 'Profile saved. Complete all required fields, then wait for admin verification.'
      );
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to save profile.');
      toast.error(
        message.includes('Doctor') || message.includes('doctor') || message.includes('access')
          ? `${message} Log out and sign in again with the Doctor role selected.`
          : message
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Profile</h1>
        <p className="text-slate-600 dark:text-violet-200/60 mt-1">
          Professional profile visible to patients when booking.
        </p>
      </div>

      {!profileComplete && !editing && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300/80">
            Complete your profile, then admin will verify you before patients can book appointments.
          </p>
        </div>
      )}

      {profileComplete && !adminApproved && !editing && (
        <div className="flex items-start gap-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
          <p className="text-sm text-violet-700 dark:text-violet-300/80">
            Profile submitted. An administrator must verify your account before you appear as a verified
            doctor and patients can book with you.
          </p>
        </div>
      )}

      {!editing ? (
        <>
          <ProfileViewCard
            name={authUser?.name ?? 'Doctor'}
            email={authUser?.email ?? ''}
            role={`Doctor · ${form.department || 'Department not set'}`}
            avatarUrl={form.avatarUrl}
            verified={adminApproved}
            pendingVerification={profileComplete && !adminApproved}
            onEdit={() => setEditing(true)}
            fields={[
              {
                label: 'Specialization',
                value: form.specialization,
                icon: <Stethoscope className="w-3.5 h-3.5 text-violet-500" />,
              },
              {
                label: 'Qualification',
                value: form.qualification,
                icon: <GraduationCap className="w-3.5 h-3.5 text-violet-500" />,
              },
              {
                label: 'Experience',
                value: formatExperienceYears(form.experienceYears),
                icon: <Briefcase className="w-3.5 h-3.5 text-violet-500" />,
              },
              {
                label: 'Checkup Fee',
                value: formatConsultationFee(form.consultationFee),
                icon: <Banknote className="w-3.5 h-3.5 text-violet-500" />,
              },
              {
                label: 'Phone',
                value: form.phone,
                icon: <Phone className="w-3.5 h-3.5 text-violet-500" />,
              },
              {
                label: 'Office Hours',
                value: formatOfficeHours(form.officeStartTime, form.officeEndTime),
                icon: <Clock className="w-3.5 h-3.5 text-violet-500" />,
              },
            ]}
          />
          {form.bio && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">About</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{form.bio}</p>
            </div>
          )}
          <DoctorAvailabilityCalendar
            availability={form.availability}
            officeStartTime={form.officeStartTime}
            officeEndTime={form.officeEndTime}
          />
        </>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
          <ProfileAvatarUpload
            name={authUser?.name ?? 'Doctor'}
            avatarUrl={form.avatarUrl}
            onChange={(url) => setForm({ ...form, avatarUrl: url })}
          />

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <Stethoscope className="w-4 h-4 text-violet-500" />
              Department
            </label>
            <select
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-theme block w-full px-3 py-2 text-sm"
            >
              <option value="">Select department</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input
              required
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="input-theme block w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <GraduationCap className="w-4 h-4 text-violet-500" />
              Degree / Qualification
            </label>
            <input
              required
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              placeholder="e.g. MBBS, FCPS"
              className="input-theme block w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <Briefcase className="w-4 h-4 text-violet-500" />
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={60}
              step={1}
              value={form.experienceYears ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  experienceYears: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="e.g. 8"
              className="input-theme block w-full px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-violet-300/60 mt-1">
              Shown on the landing page and when patients browse doctors.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <Banknote className="w-4 h-4 text-violet-500" />
              Checkup Fee (Rs.)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={form.consultationFee ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  consultationFee: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="e.g. 2500"
              className="input-theme block w-full px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-violet-300/60 mt-1">
              Patients will see this fee on the landing page and when booking.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })}
              placeholder="+92 300 0000000"
              className="input-theme block w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.availability.includes(day)
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                      : 'border border-violet-200 dark:border-violet-800 text-slate-600 dark:text-violet-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Office From</label>
              <input
                type="time"
                required
                value={form.officeStartTime}
                onChange={(e) => setForm({ ...form, officeStartTime: e.target.value })}
                className="input-theme block w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Office To</label>
              <input
                type="time"
                required
                value={form.officeEndTime}
                onChange={(e) => setForm({ ...form, officeEndTime: e.target.value })}
                className="input-theme block w-full px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-theme block w-full px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" onClick={() => { setEditing(false); loadProfile(); }} className="btn-secondary px-6 py-2.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
