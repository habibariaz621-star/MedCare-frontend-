'use client';

import ProfileAvatarUpload from '@/components/common/ProfileAvatarUpload';
import { Mail, Phone, MapPin, Calendar, Pencil, BadgeCheck } from 'lucide-react';

interface ProfileField {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

interface ProfileViewCardProps {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  fields: ProfileField[];
  verified?: boolean;
  pendingVerification?: boolean;
  onEdit: () => void;
}

export default function ProfileViewCard({
  name,
  email,
  role,
  avatarUrl,
  fields,
  verified,
  pendingVerification,
  onEdit,
}: ProfileViewCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
      <div className="px-6 pb-6 -mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <ProfileAvatarUpload name={name} avatarUrl={avatarUrl} onChange={() => {}} editable={false} />
          <button type="button" onClick={onEdit} className="btn-primary text-sm px-4 py-2 self-start sm:self-auto">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h2>
            {verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            {!verified && pendingVerification && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                Pending admin verification
              </span>
            )}
          </div>
          <p className="text-sm text-violet-600 dark:text-violet-400 font-medium capitalize mt-0.5">{role}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {email}
          </p>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {fields.map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-xl border border-violet-200/70 dark:border-violet-800/50 bg-white/60 dark:bg-violet-950/30 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {label}
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                {icon}
                {value || '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Mail, Phone, MapPin, Calendar };
