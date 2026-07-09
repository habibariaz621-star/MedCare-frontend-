'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/apiError';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Mail } from 'lucide-react';
import { CLINIC_SHORT_NAME } from '@/lib/branding';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const result = await authService.forgotPassword(email);
      if (!authService.isMockMode() && result.otpDelivered === false) {
        setError(
          'Could not send email. Configure SMTP_USER and SMTP_PASS in medcare-backend/.env (Gmail App Password), restart backend, then try again.',
        );
        return;
      }

      const query = new URLSearchParams({ email });
      sessionStorage.setItem(
        'medcare_reset_hint',
        authService.isMockMode()
          ? 'Demo mode — use the reset code shown on the next screen.'
          : `Password reset code sent to ${email}. Check your inbox and spam folder.`,
      );
      if (authService.isMockMode() && result.devOtp) {
        sessionStorage.setItem('medcare_mock_reset_otp', result.devOtp);
      }
      router.push(`/reset-password?${query.toString()}`);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Could not send reset code.');
      setError(message);
      if (message.toLowerCase().includes('not verified')) {
        const query = new URLSearchParams({ email });
        setInfo('Verify your email first. We will redirect you to email verification.');
        setTimeout(() => router.push(`/verify-email?${query.toString()}`), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle={`Reset your ${CLINIC_SHORT_NAME} account — verified email required`}
      footer={
        <p className="auth-footer">
          Remember your password? <Link href="/login">Sign In</Link>
        </p>
      }
    >
      <div className="auth-alert auth-alert-info text-sm">
        Password reset is only available after your email is verified. We will email you a 6-digit code.
      </div>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {info && <div className="auth-alert auth-alert-info">{info}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label" htmlFor="forgot-email">
            Registered email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="you@medcare.com"
            className="auth-input"
          />
        </div>

        <button type="submit" disabled={loading || !email} className="btn-auth-submit">
          <Mail className="w-4 h-4 inline mr-1" />
          {loading ? 'Sending code...' : 'Send reset code to email'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 p-8 text-center">Loading...</p>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
