'use client';

import { useEffect } from 'react';
import AuthRedirect from '@/components/guards/AuthRedirect';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = html.style.height;

    html.classList.add('auth-route-lock');
    document.body.classList.add('auth-route-lock');
    document.body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    html.style.height = '100%';
    document.body.style.height = '100%';
    html.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      html.classList.remove('auth-route-lock');
      document.body.classList.remove('auth-route-lock');
      document.body.style.overflow = prevOverflow;
      html.style.overflow = prevHtmlOverflow;
      document.body.style.height = prevBodyHeight;
      html.style.height = prevHtmlHeight;
      html.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <div className="auth-layout-root">
      <ThemeToggle className="auth-theme-toggle" />
      <div className="auth-layout-inner">
        <AuthRedirect>{children}</AuthRedirect>
      </div>
    </div>
  );
}
