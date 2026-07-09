'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { appointmentService } from '@/services/appointment.service';
import { DEPARTMENT_OPTIONS } from '@/services/mockDoctors';
import DoctorPublicCard from '@/components/common/DoctorPublicCard';
import type { Doctor } from '@/types';

function groupByDepartment(doctors: Doctor[]): { department: string; doctors: Doctor[] }[] {
  const map = new Map<string, Doctor[]>();

  for (const doctor of doctors) {
    const key = doctor.department?.trim() || 'Other';
    const list = map.get(key) ?? [];
    list.push(doctor);
    map.set(key, list);
  }

  const preferredOrder = DEPARTMENT_OPTIONS;
  const entries = Array.from(map.entries()).map(([department, list]) => ({
    department,
    doctors: list,
  }));

  return entries.sort((a, b) => {
    const ai = preferredOrder.indexOf(a.department);
    const bi = preferredOrder.indexOf(b.department);
    if (ai === -1 && bi === -1) return a.department.localeCompare(b.department);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function LandingDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await appointmentService.getPublicDoctors({
          search,
          department,
          page: 1,
          limit: 100,
        });
        setDoctors(response.data ?? []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(timer);
  }, [search, department]);

  const categories = useMemo(() => groupByDepartment(doctors), [doctors]);

  return (
    <section id="our-doctors" className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
            Our Doctors
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Meet Our Specialists
          </h2>
          <p className="mt-3 text-slate-600 dark:text-violet-200/60 max-w-2xl mx-auto">
            Browse doctors by department — cardiology, pediatrics, dermatology, and more.
            Login only when you are ready to book.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          <div className="relative max-w-md mx-auto w-full">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-theme w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['', ...DEPARTMENT_OPTIONS].map((dept) => {
              const active = department === dept;
              const label = dept || 'All';
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDepartment(dept)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25'
                      : 'border border-violet-200 dark:border-violet-800 text-slate-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-slate-500 glass-card rounded-2xl">
            <p>No doctors available in this category yet.</p>
            <p className="text-sm mt-2 text-violet-500/80">
              Registered doctors appear here after completing their profile and admin verification.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(({ department: deptName, doctors: deptDoctors }) => (
              <div key={deptName} className="animate-fade-up">
                <div className="flex items-end justify-between gap-4 mb-5 pb-3 border-b border-violet-200/60 dark:border-violet-800/40">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
                      Category
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {deptName}
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-violet-300/60 shrink-0">
                    {deptDoctors.length} {deptDoctors.length === 1 ? 'doctor' : 'doctors'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deptDoctors.map((doctor) => (
                    <DoctorPublicCard
                      key={doctor._id}
                      doctor={doctor}
                      action={
                        <Link
                          href="/register"
                          className="btn-primary w-full py-2 text-sm justify-center"
                        >
                          Book Appointment
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-violet-300/60 mt-10">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            Sign in to book
          </Link>
        </p>
      </div>
    </section>
  );
}
