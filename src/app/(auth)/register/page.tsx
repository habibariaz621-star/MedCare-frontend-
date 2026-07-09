'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/apiError';
import AuthPageShell from '@/components/auth/AuthPageShell';
import PasswordInput from '@/components/auth/PasswordInput';
import type { UserRole } from '@/types';
import { CLINIC_SHORT_NAME, CLINIC_TAGLINE } from '@/lib/branding';

const fields = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@medcare.com' },
  { name: 'password', label: 'Password', placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••' },
] as const;

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Patient' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'email' ? value.toLowerCase() : value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { name, email, password, role } = formData;
      const result = await authService.register({ name, email, password, role });
      if (!authService.isMockMode() && result.otpDelivered === false) {
        setError(
          'Account created but email could not be sent. Ask admin to configure SMTP_USER and SMTP_PASS in backend .env (Gmail App Password), then use Resend OTP.',
        );
        setLoading(false);
        return;
      }
      const query = new URLSearchParams({ email });
      sessionStorage.setItem(
        'medcare_otp_hint',
        authService.isMockMode()
          ? `Demo mode — use the code shown below.`
          : `Verification code sent to ${email}. Open your email inbox and enter the 6-digit OTP below.`,
      );
      if (authService.isMockMode() && result.devOtp) {
        sessionStorage.setItem('medcare_mock_otp', result.devOtp);
      }
      router.push(`/verify-email?${query.toString()}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Create account"
      subtitle={`Join ${CLINIC_SHORT_NAME} — ${CLINIC_TAGLINE}`}
      variant="register"
      footer={
        <p className="auth-footer">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      }
    >
      {authService.isMockMode() && (
        <div className="auth-alert auth-alert-info">
          Demo mode — saves locally.
        </div>
      )}

      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {success && <div className="auth-alert auth-alert-success">{success}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label" htmlFor="register-role">
            Register as
          </label>
          <select
            id="register-role"
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

        {fields.map((field) => (
          <div key={field.name}>
            <label className="auth-label" htmlFor={`register-${field.name}`}>
              {field.label}
            </label>
            {field.name === 'password' || field.name === 'confirmPassword' ? (
              <PasswordInput
                id={`register-${field.name}`}
                name={field.name}
                required
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                id={`register-${field.name}`}
                name={field.name}
                type={field.type}
                required
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="auth-input"
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn-auth-submit">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </AuthPageShell>
  );
}
