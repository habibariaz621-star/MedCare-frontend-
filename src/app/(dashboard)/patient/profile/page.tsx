'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProfile } from '@/store/slices/profileSlice';
import { setCredentials } from '@/store/slices/authSlice';
import { patientService } from '@/services/patient.service';
import ProfileViewCard from '@/components/common/ProfileViewCard';
import ProfileAvatarUpload from '@/components/common/ProfileAvatarUpload';
import { Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { User } from '@/types';
import { phoneValidationMessage, sanitizePhoneInput } from '@/lib/phoneInput';

export default function PatientProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [editing, setEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = () => {
    if (!authUser?.id) return;
    patientService
      .getProfile(authUser.id)
      .then((data: User) => {
        setSavedProfile(data);
        setForm({
          name: data.name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          dateOfBirth: data.dateOfBirth ?? '',
          avatarUrl: data.avatarUrl ?? '',
        });
        dispatch(setProfile(data));
      })
      .catch(() => {
        if (authUser) {
          const fallback = {
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone ?? '',
            address: authUser.address ?? '',
            dateOfBirth: authUser.dateOfBirth ?? '',
            avatarUrl: authUser.avatarUrl ?? '',
          };
          setSavedProfile({ ...authUser, ...fallback });
          setForm({ ...fallback, email: authUser.email });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, [dispatch, authUser?.id]);

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
      const updated = await patientService.updateProfile(authUser.id, {
        name: form.name,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        avatarUrl: form.avatarUrl,
      });
      setSavedProfile(updated);
      dispatch(setProfile(updated));
      if (authUser && token) {
        dispatch(setCredentials({ user: { ...authUser, ...updated }, token }));
      }
      setEditing(false);
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedProfile) {
      setForm({
        name: savedProfile.name ?? '',
        email: savedProfile.email ?? '',
        phone: savedProfile.phone ?? '',
        address: savedProfile.address ?? '',
        dateOfBirth: savedProfile.dateOfBirth ?? '',
        avatarUrl: savedProfile.avatarUrl ?? '',
      });
    }
    setEditing(false);
  };

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  const display = savedProfile ?? authUser;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and update your personal information and profile photo.
        </p>
      </div>

      {!editing && display ? (
        <ProfileViewCard
          name={display.name}
          email={display.email}
          role="Patient"
          avatarUrl={display.avatarUrl}
          verified={Boolean(display.phone && display.address)}
          onEdit={() => setEditing(true)}
          fields={[
            {
              label: 'Phone',
              value: display.phone,
              icon: <Phone className="w-3.5 h-3.5 text-violet-500" />,
            },
            {
              label: 'Address',
              value: display.address,
              icon: <MapPin className="w-3.5 h-3.5 text-violet-500" />,
            },
            {
              label: 'Date of Birth',
              value: display.dateOfBirth
                ? new Date(display.dateOfBirth).toLocaleDateString()
                : undefined,
              icon: <Calendar className="w-3.5 h-3.5 text-violet-500" />,
            },
          ]}
        />
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
          <ProfileAvatarUpload
            name={form.name}
            avatarUrl={form.avatarUrl}
            onChange={(url) => setForm({ ...form, avatarUrl: url })}
          />

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-theme block w-full mt-1 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              disabled
              value={form.email}
              className="w-full mt-1 input-theme px-3 py-2 text-sm opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })}
              placeholder="+92 300 0000000"
              className="input-theme block w-full mt-1 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="City, Area"
              className="input-theme block w-full mt-1 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="input-theme block w-full mt-1 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary px-6 py-2.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
