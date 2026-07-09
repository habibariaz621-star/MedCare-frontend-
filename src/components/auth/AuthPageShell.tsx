'use client';

import Link from 'next/link';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

interface AuthPageShellProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'register';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthPageShell({
  title,
  subtitle,
  variant = 'default',
  children,
  footer,
}: AuthPageShellProps) {
  const cardClass =
    variant === 'register' ? 'auth-card auth-card--register' : 'auth-card';

  return (
    <div className="auth-page">
      <div className={cardClass}>
        <div className="auth-card-header">
          <Link href="/" className="auth-brand-link hover:underline">
            {CLINIC_SHORT_NAME}
          </Link>
          <h1 className="auth-title">{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}
