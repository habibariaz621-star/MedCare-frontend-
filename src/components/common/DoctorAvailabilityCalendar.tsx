'use client';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface DoctorAvailabilityCalendarProps {
  availability: string[];
  officeStartTime: string;
  officeEndTime: string;
}

export default function DoctorAvailabilityCalendar({
  availability,
  officeStartTime,
  officeEndTime,
}: DoctorAvailabilityCalendarProps) {
  return (
    <div className="dashboard-panel p-5">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Availability Calendar</h3>
      <p className="text-xs text-slate-500 mb-4">
        Office hours: {officeStartTime} – {officeEndTime}
      </p>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const available = availability.includes(day);
          return (
            <div
              key={day}
              className={`rounded-xl p-3 text-center border transition-colors ${
                available
                  ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800'
                  : 'bg-violet-50/50 dark:bg-violet-950/30 border-violet-200/60 dark:border-violet-800/40 opacity-50'
              }`}
            >
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{day}</p>
              <p
                className={`text-[10px] mt-1 font-medium ${
                  available ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                }`}
              >
                {available ? 'Available' : 'Off'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
