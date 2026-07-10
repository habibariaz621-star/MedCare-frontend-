import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle,
  HeartPulse,
  Microscope,
  Pill,
  Ambulance,
  BedDouble,
  Clock,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  CLINIC_NAME,
  CLINIC_TAGLINE,
  CLINIC_SUBTITLE,
  CLINIC_SINCE,
  CLINIC_EMERGENCY,
  CLINIC_ADDRESS,
} from '@/lib/branding';
import LandingNav, { LandingHeroActions, LandingBottomCTA } from '@/components/common/LandingNav';
import LandingDoctors from '@/components/common/LandingDoctors';
import ThemeToggle from '@/components/common/ThemeToggle';

const facilities = [
  {
    icon: HeartPulse,
    title: '24/7 Emergency Care',
    desc: 'Round-the-clock emergency unit with trained staff and life-support equipment.',
    image: '/clinic/hospital.jpg',
  },
  {
    icon: Microscope,
    title: 'Digital Lab & X-Ray',
    desc: 'Modern pathology lab, ultrasound, and digital imaging for fast diagnosis.',
    image: '/clinic/lab.jpg',
  },
  {
    icon: Activity,
    title: 'Operation Theater',
    desc: 'Fully equipped OT with advanced monitors and sterile surgical environment.',
    image: '/clinic/operation-theater.jpg',
  },
  {
    icon: Pill,
    title: 'In-House Pharmacy',
    desc: 'Licensed pharmacy with genuine medicines available on prescription.',
    image: '/clinic/equipment.jpg',
  },
  {
    icon: Ambulance,
    title: 'Ambulance Service',
    desc: 'Quick response ambulance with oxygen and emergency medical kits.',
    image: '/clinic/ambulance.jpg',
  },
  {
    icon: BedDouble,
    title: 'ICU & Patient Rooms',
    desc: 'Comfortable private rooms and intensive care with 24-hour nursing.',
    image: '/clinic/icu.jpg',
  },
  {
    icon: Clock,
    title: 'Online Appointments',
    desc: 'Book, reschedule, or cancel visits online without long waiting queues.',
    image: '/clinic/online-appointment.jpg',
  },
  {
    icon: ShieldCheck,
    title: 'Specialist Doctors',
    desc: 'Experienced consultants across cardiology, pediatrics, dermatology & more.',
    image: '/clinic/doctor.jpg',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="brand-blob w-72 h-72 bg-violet-500 top-20 -left-20 animate-float" />
      <div className="brand-blob w-96 h-96 bg-fuchsia-500 top-40 right-0 animate-float-slow" />

      {/* Header */}
      <header className="relative border-b border-violet-200/60 dark:border-violet-900/40 glass-card sticky top-0 z-20 animate-fade-in overflow-visible">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-2 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-gradient leading-tight truncate">
                {CLINIC_NAME}
              </p>
              <p className="hidden sm:block text-[10px] uppercase tracking-widest text-violet-500 dark:text-violet-400 font-semibold truncate">
                {CLINIC_SUBTITLE}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <LandingNav />
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="animate-fade-up text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">
                Trusted Healthcare Since {CLINIC_SINCE}
              </p>
              <h1 className="animate-fade-up stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
                Welcome to{' '}
                <span className="text-gradient">{CLINIC_NAME}</span>
              </h1>
              <p className="animate-fade-up stagger-2 mt-2 text-lg font-medium text-violet-700 dark:text-violet-300">
                {CLINIC_TAGLINE}
              </p>
              <p className="animate-fade-up stagger-2 mt-4 text-slate-600 dark:text-violet-200/70 leading-relaxed">
                Your health is our priority. We provide complete medical care — from
                checkups and diagnostics to emergency services — with compassionate
                doctors and modern clinic equipment.
              </p>
              <LandingHeroActions />
              <div className="animate-fade-up stagger-4 mt-8 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-violet-300/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" /> Open 24/7
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" /> 50+ Specialists
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" /> ISO Certified
                </span>
              </div>
            </div>

            <div className="animate-fade-up stagger-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20 border border-violet-200/50 dark:border-violet-800/40 aspect-[4/3]">
                <Image
                  src="/clinic/hero.jpg"
                  alt={`${CLINIC_NAME} clinic interior`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl p-4">
                  <p className="text-white font-semibold">{CLINIC_NAME}</p>
                  <p className="text-violet-200 text-sm">{CLINIC_TAGLINE}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section className="bg-gradient-to-b from-violet-50/80 to-transparent dark:from-violet-950/30 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 animate-fade-up">
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                Our Facilities
              </p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Complete Care Under One Roof
              </h2>
              <p className="mt-3 text-slate-600 dark:text-violet-200/60 max-w-2xl mx-auto">
                From emergency response to specialist consultations — everything you need
                for your family&apos;s health.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {facilities.map(({ icon: Icon, title, desc, image }, i) => (
                <div
                  key={title}
                  className={`glass-card rounded-2xl overflow-hidden card-hover animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-950/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm">{title}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center mb-2 shadow-md shadow-violet-500/25">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-violet-200/60 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Doctors — public, no login required */}
        <LandingDoctors />

        {/* Why choose us */}
        <section className="relative bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950 text-white py-16 md:py-20 overflow-hidden">
          <div className="brand-blob w-80 h-80 bg-fuchsia-600 top-0 right-0 opacity-20 animate-float" />
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] animate-fade-up shadow-2xl shadow-violet-500/20 border border-violet-700/40">
              <Image
                src="/clinic/hero.jpg"
                alt={`${CLINIC_NAME} clinic interior`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl p-4">
                <p className="text-white font-semibold">{CLINIC_NAME}</p>
                <p className="text-violet-200 text-sm">{CLINIC_TAGLINE}</p>
              </div>
            </div>
            <div className="animate-fade-up stagger-2">
              <h2 className="text-3xl font-bold">Why Choose {CLINIC_NAME}?</h2>
              <ul className="mt-6 space-y-4">
                {[
                  'Experienced doctors across all major departments',
                  'Hygienic rooms with latest medical equipment',
                  'Easy online appointment booking for patients',
                  'Affordable consultation fees and transparent billing',
                  'Dedicated staff focused on patient comfort & safety',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-violet-100">
                    <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <LandingBottomCTA />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-violet-200/50 dark:border-violet-900/40 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-bold text-gradient">{CLINIC_NAME}</p>
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">{CLINIC_TAGLINE}</p>
          <p className="text-sm text-slate-500 dark:text-violet-300/50 mt-4">
            &copy; {new Date().getFullYear()} {CLINIC_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-violet-400/40 mt-1">
            {CLINIC_ADDRESS} · Emergency: {CLINIC_EMERGENCY}
          </p>
        </div>
      </footer>
    </div>
  );
}
