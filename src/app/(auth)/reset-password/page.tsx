'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/apiError';
import AuthPageShell from '@/components/auth/AuthPageShell';
import PasswordInput from '@/components/auth/PasswordInput';
import { KeyRound, Mail, RefreshCw } from 'lucide-react';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    const stored = sessionStorage.getItem('medcare_reset_hint');
    const storedMockOtp = sessionStorage.getItem('medcare_mock_reset_otp');
    if (stored) {
      setInfo(stored);
      sessionStorage.removeItem('medcare_reset_hint');
    } else if (emailParam) {
      setInfo(`Enter the 6-digit reset code sent to ${emailParam}.`);
    }
    if (storedMockOtp) {
      setMockOtp(storedMockOtp);
      sessionStorage.removeItem('medcare_mock_reset_otp');
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword({ email, otp, newPassword: password });
      setSuccess(result.message ?? 'Password updated successfully.');
      setInfo('');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not reset password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.forgotPassword(email);
      if (!authService.isMockMode() && result.otpDelivered === false) {
        setError(
          'Could not send email. Configure SMTP_USER and SMTP_PASS in medcare-backend/.env (Gmail App Password), restart backend, then try again.',
        );
        return;
      }
      setSuccess(result.message ?? 'New reset code sent.');
      setInfo(`A new code was sent to ${email}. Check your inbox and spam folder.`);
      if (authService.isMockMode() && result.devOtp) {
        setMockOtp(result.devOtp);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not resend reset code.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageShell
      title="Reset password"
      subtitle={`Verify the email code, then set a new password — ${CLINIC_SHORT_NAME}`}
      footer={
        <p className="auth-footer">
          Back to <Link href="/login">Sign In</Link>
        </p>
      }
    >
      {authService.isMockMode() && mockOtp && (
        <div className="auth-alert auth-alert-info text-center">
          <p className="text-sm mb-2">Demo reset code (mock mode only)</p>
          <p className="text-2xl font-bold tracking-[0.35em] text-violet-700 dark:text-violet-300">
            {mockOtp}
          </p>
        </div>
      )}

      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {success && <div className="auth-alert auth-alert-success">{success}</div>}
      {info && <div className="auth-alert auth-alert-info">{info}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label" htmlFor="reset-email">
            Email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="you@medcare.com"
            className="auth-input"
          />
        </div>

        <div>
          <label className="auth-label" htmlFor="reset-otp">
            6-digit code from email
          </label>
          <input
            id="reset-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="auth-input text-center text-lg tracking-[0.4em] font-semibold"
          />
        </div>

        <div>
          <label className="auth-label" htmlFor="reset-password">
            New password
          </label>
          <PasswordInput
            id="reset-password"
            name="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="auth-label" htmlFor="reset-confirm-password">
            Confirm new password
          </label>
          <PasswordInput
            id="reset-confirm-password"
            name="confirmPassword"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn-auth-submit"
        >
          <KeyRound className="w-4 h-4 inline mr-1" />
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || !email}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:underline disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
        {resending ? 'Sending...' : 'Resend reset code to email'}
      </button>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 p-8 text-center">Loading...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
