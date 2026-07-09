'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/apiError';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Mail, RefreshCw } from 'lucide-react';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    const stored = sessionStorage.getItem('medcare_otp_hint');
    const storedMockOtp = sessionStorage.getItem('medcare_mock_otp');
    if (stored) {
      setInfo(stored);
      sessionStorage.removeItem('medcare_otp_hint');
    } else if (emailParam) {
      setInfo(`Enter the 6-digit code sent to ${emailParam}. Check inbox and spam folder.`);
    }
    if (storedMockOtp) {
      setMockOtp(storedMockOtp);
      sessionStorage.removeItem('medcare_mock_otp');
    }
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.verifyEmail(email, otp);
      setSuccess(result.message ?? 'Email verified!');
      setInfo('');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Verification failed. Please try again.'));
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
      const result = await authService.resendOtp(email);
      if (!authService.isMockMode() && result.otpDelivered === false) {
        setError(
          'Could not send email. Configure SMTP_USER and SMTP_PASS in medcare-backend/.env (Gmail App Password), restart backend, then try again.',
        );
        return;
      }
      setSuccess(result.message ?? 'New code sent.');
      setInfo(`A new code was sent to ${email}. Check your inbox and spam folder.`);
      if (authService.isMockMode() && result.devOtp) {
        setMockOtp(result.devOtp);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not resend OTP.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageShell
      title="Verify your email"
      subtitle={
        email
          ? `Check ${email} for your verification code`
          : `Enter the code from your email — ${CLINIC_SHORT_NAME}`
      }
      footer={
        <p className="auth-footer">
          Already verified? <a href="/login">Sign In</a>
        </p>
      }
    >
      {authService.isMockMode() && mockOtp && (
        <div className="auth-alert auth-alert-info text-center">
          <p className="text-sm mb-2">Demo OTP (mock mode only)</p>
          <p className="text-2xl font-bold tracking-[0.35em] text-violet-700 dark:text-violet-300">
            {mockOtp}
          </p>
        </div>
      )}

      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {success && <div className="auth-alert auth-alert-success">{success}</div>}
      {info && <div className="auth-alert auth-alert-info">{info}</div>}

      <form className="auth-form" onSubmit={handleVerify}>
        <div>
          <label className="auth-label" htmlFor="verify-email">
            Email
          </label>
          <input
            id="verify-email"
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
          <label className="auth-label" htmlFor="verify-otp">
            6-digit OTP from email
          </label>
          <input
            id="verify-otp"
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

        <button type="submit" disabled={loading || otp.length !== 6} className="btn-auth-submit">
          <Mail className="w-4 h-4 inline mr-1" />
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || !email}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:underline disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
        {resending ? 'Sending...' : 'Resend OTP to email'}
      </button>
    </AuthPageShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 p-8 text-center">Loading...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
