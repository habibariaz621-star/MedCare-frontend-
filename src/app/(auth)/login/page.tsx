'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { MOCK_DEMO_ACCOUNTS } from '@/services/mockAuth';
import AuthPageShell from '@/components/auth/AuthPageShell';
import PasswordInput from '@/components/auth/PasswordInput';
import { CLINIC_TAGLINE } from '@/lib/branding';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Patient',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'email' ? value.toLowerCase() : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Welcome back!');

      if (data.user.role === 'Admin') router.push('/admin');
      else if (data.user.role === 'Doctor') router.push('/doctor');
      else router.push('/patient');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Invalid credentials. Please try again.');
      setError(message);
      toast.error(message);
      if (message.toLowerCase().includes('not verified')) {
        const query = new URLSearchParams({ email: formData.email });
        setTimeout(() => router.push(`/verify-email?${query.toString()}`), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Sign in"
      subtitle={CLINIC_TAGLINE}
      footer={
        <p className="auth-footer">
          No account? <a href="/register">Register</a>
        </p>
      }
    >
      {authService.isMockMode() && (
        <div className="auth-alert auth-alert-info">
          <p className="font-semibold mb-1">Demo mode (no backend)</p>
          {MOCK_DEMO_ACCOUNTS.map((acc) => (
            <p key={acc.email}>
              {acc.role}: {acc.email} / {acc.password}
            </p>
          ))}
        </div>
      )}

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label" htmlFor="login-role">
            Role
          </label>
          <select
            id="login-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="auth-input"
          >
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Administrator</option>
          </select>
        </div>

        <div>
          <label className="auth-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@medcare.com"
            className="auth-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <label className="auth-label mb-0" htmlFor="login-password">
              Password
            </label>
            <Link
              href={formData.email ? `/forgot-password?email=${encodeURIComponent(formData.email)}` : '/forgot-password'}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-auth-submit py-2.5 text-sm">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthPageShell>
  );
}
