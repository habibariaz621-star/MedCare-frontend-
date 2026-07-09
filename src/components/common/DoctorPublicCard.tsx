import Image from 'next/image';
import { GraduationCap, Stethoscope, Banknote, Briefcase } from 'lucide-react';
import { getInitials } from '@/lib/profileImage';
import { formatConsultationFee } from '@/lib/formatFee';
import { formatExperienceYears } from '@/lib/formatExperience';
import type { Doctor } from '@/types';

interface DoctorPublicCardProps {
  doctor: Doctor;
  action?: React.ReactNode;
}

export default function DoctorPublicCard({ doctor, action }: DoctorPublicCardProps) {
  const initials = getInitials(doctor.name);

  return (
    <div className="glass-card rounded-2xl p-5 card-hover flex flex-col h-full">
      <div className="flex items-start gap-4">
        <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-500/25">
          {doctor.avatarUrl ? (
            <Image
              src={doctor.avatarUrl}
              alt={doctor.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <span className="text-white font-bold text-2xl">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <span className="text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full uppercase">
            {doctor.department}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
            Dr. {doctor.name}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-2 flex-1">
        {doctor.specialization && (
          <p className="flex items-start gap-2 text-sm text-violet-600 dark:text-violet-400 font-medium">
            <Stethoscope className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{doctor.specialization}</span>
          </p>
        )}
        {doctor.qualification && (
          <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-violet-200/70">
            <GraduationCap className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
            <span>{doctor.qualification}</span>
          </p>
        )}
        {doctor.experienceYears != null && doctor.experienceYears > 0 && (
          <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-violet-200/70">
            <Briefcase className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
            <span>{formatExperienceYears(doctor.experienceYears)}</span>
          </p>
        )}
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
          <Banknote className="w-4 h-4 shrink-0" />
          Checkup: {formatConsultationFee(doctor.consultationFee)}
        </p>
      </div>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
