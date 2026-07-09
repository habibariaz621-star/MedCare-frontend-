import type { User, UserRole } from '@/types';
import { createDoctorProfileStub } from './mockDoctors';

const USERS_KEY = 'medcare_mock_users';
const OTP_KEY = 'medcare_mock_otp';
const RESET_OTP_KEY = 'medcare_mock_reset_otp';

interface MockUser extends User {
  password: string;
  emailVerified?: boolean;
  isActive?: boolean;
}

interface StoredOtp {
  email: string;
  otp: string;
  expiresAt: number;
}

function loadUsers(): MockUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadOtps(): StoredOtp[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OTP_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOtps(list: StoredOtp[]) {
  localStorage.setItem(OTP_KEY, JSON.stringify(list));
}

function loadResetOtps(): StoredOtp[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RESET_OTP_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveResetOtps(list: StoredOtp[]) {
  localStorage.setItem(RESET_OTP_KEY, JSON.stringify(list));
}

function issueMockOtp(email: string) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const normalized = email.toLowerCase();
  const others = loadOtps().filter((o) => o.email !== normalized);
  saveOtps([
    ...others,
    { email: normalized, otp, expiresAt: Date.now() + 10 * 60 * 1000 },
  ]);
  return otp;
}

function issueMockResetOtp(email: string) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const normalized = email.toLowerCase();
  const others = loadResetOtps().filter((o) => o.email !== normalized);
  saveResetOtps([
    ...others,
    { email: normalized, otp, expiresAt: Date.now() + 10 * 60 * 1000 },
  ]);
  return otp;
}

function toPublicUser(user: MockUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
  };
}

function seedDemoUsers(): MockUser[] {
  return [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@medcare.com',
      password: 'admin123',
      role: 'Admin',
      emailVerified: true,
    },
    {
      id: 'doctor-1',
      name: 'Sarah Khan',
      email: 'doctor@medcare.com',
      password: 'doctor123',
      role: 'Doctor',
      emailVerified: true,
    },
    {
      id: 'patient-1',
      name: 'John Patient',
      email: 'patient@medcare.com',
      password: 'patient123',
      role: 'Patient',
      phone: '+92 321 5550101',
      address: 'Gulberg, Lahore',
      dateOfBirth: '1992-08-15',
      emailVerified: true,
    },
  ];
}

function ensureSeedUsers() {
  const existing = loadUsers();
  if (existing.length === 0) {
    saveUsers(seedDemoUsers());
  }
}

export const mockAuth = {
  getUserStats() {
    ensureSeedUsers();
    const users = loadUsers();
    return {
      patients: users.filter((u) => u.role === 'Patient').length,
      doctors: users.filter((u) => u.role === 'Doctor').length,
      admins: users.filter((u) => u.role === 'Admin').length,
    };
  },

  removeUserByEmail(email: string) {
    ensureSeedUsers();
    saveUsers(loadUsers().filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
  },

  register(userData: { name: string; email: string; password: string; role?: string }) {
    ensureSeedUsers();
    const users = loadUsers();
    const email = userData.email.toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === email)) {
      throw { response: { data: { message: 'Email is already registered.' } } };
    }

    const role = (['Admin', 'Doctor', 'Patient'].includes(userData.role || '')
      ? userData.role
      : 'Patient') as UserRole;

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role,
      emailVerified: false,
    };

    saveUsers([...users, newUser]);
    const otp = issueMockOtp(email);

    if (role === 'Doctor') {
      createDoctorProfileStub(newUser.id, newUser.name, newUser.email);
    }

    return {
      message: 'Registration successful. Please verify your email with the OTP.',
      requiresVerification: true,
      email: userData.email,
      otpDelivered: false,
      devOtp: otp,
    };
  },

  verifyEmail(email: string, otp: string) {
    ensureSeedUsers();
    const normalized = email.toLowerCase();
    const users = loadUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
    if (index === -1) {
      throw { response: { data: { message: 'Account not found for this email.' } } };
    }

    if (users[index].emailVerified) {
      return { message: 'Email is already verified. You can sign in.' };
    }

    const record = loadOtps().find((o) => o.email === normalized);
    if (!record) {
      throw { response: { data: { message: 'No active OTP. Please request a new code.' } } };
    }
    if (record.expiresAt < Date.now()) {
      throw { response: { data: { message: 'OTP has expired. Please request a new code.' } } };
    }
    if (record.otp !== otp.trim()) {
      throw { response: { data: { message: 'Invalid OTP. Please try again.' } } };
    }

    users[index] = { ...users[index], emailVerified: true };
    saveUsers(users);
    saveOtps(loadOtps().filter((o) => o.email !== normalized));

    return { message: 'Email verified successfully. You can now sign in.' };
  },

  resendOtp(email: string) {
    ensureSeedUsers();
    const normalized = email.toLowerCase();
    const user = loadUsers().find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw { response: { data: { message: 'Account not found for this email.' } } };
    }
    if (user.emailVerified) {
      return { message: 'Email is already verified. You can sign in.' };
    }

    const otp = issueMockOtp(normalized);
    return {
      message: 'A new verification code has been sent.',
      otpDelivered: false,
      devOtp: otp,
    };
  },

  forgotPassword(email: string) {
    ensureSeedUsers();
    const normalized = email.toLowerCase();
    const user = loadUsers().find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw { response: { data: { message: 'Account not found for this email.' } } };
    }
    if (!user.emailVerified) {
      throw {
        response: {
          data: {
            message:
              'Email is not verified yet. Please verify your email first, then you can reset your password.',
          },
        },
      };
    }
    if (user.isActive === false) {
      throw {
        response: {
          data: { message: 'This account has been deactivated. Contact support to restore access.' },
        },
      };
    }

    const otp = issueMockResetOtp(normalized);
    return {
      message: `Password reset code sent to ${user.email}.`,
      email: user.email,
      otpDelivered: false,
      devOtp: otp,
    };
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    ensureSeedUsers();
    const normalized = data.email.toLowerCase();
    const users = loadUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
    if (index === -1) {
      throw { response: { data: { message: 'Account not found for this email.' } } };
    }

    if (!users[index].emailVerified) {
      throw {
        response: {
          data: {
            message:
              'Email is not verified yet. Please verify your email before resetting your password.',
          },
        },
      };
    }

    const record = loadResetOtps().find((o) => o.email === normalized);
    if (!record) {
      throw {
        response: { data: { message: 'No active reset code. Please request a new password reset email.' } },
      };
    }
    if (record.expiresAt < Date.now()) {
      throw {
        response: { data: { message: 'Reset code has expired. Please request a new password reset email.' } },
      };
    }
    if (record.otp !== data.otp.trim()) {
      throw { response: { data: { message: 'Invalid reset code. Please try again.' } } };
    }

    users[index] = { ...users[index], password: data.newPassword };
    saveUsers(users);
    saveResetOtps(loadResetOtps().filter((o) => o.email !== normalized));

    return { message: 'Password updated successfully. You can now sign in with your new password.' };
  },

  login(credentials: { email: string; password: string; role?: string }) {
    ensureSeedUsers();
    const users = loadUsers();
    const email = credentials.email.toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);

    if (!user || user.password !== credentials.password) {
      throw { response: { data: { message: 'Invalid email or password.' } } };
    }

    if (user.isActive === false) {
      throw {
        response: {
          data: { message: 'This account has been deactivated. Contact support to restore access.' },
        },
      };
    }

    if (!user.emailVerified) {
      throw {
        response: {
          data: {
            message: 'Email not verified. Please enter the OTP sent to your email.',
          },
        },
      };
    }

    if (credentials.role && user.role !== credentials.role) {
      throw {
        response: {
          data: { message: `This account is registered as ${user.role}, not ${credentials.role}.` },
        },
      };
    }

    return {
      user: toPublicUser(user),
      token: `mock-token-${user.id}`,
    };
  },

  getProfile(userId: string): User {
    ensureSeedUsers();
    const user = loadUsers().find((u) => u.id === userId);
    if (!user) throw { response: { data: { message: 'User not found.' } } };
    return toPublicUser(user);
  },

  updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: string;
      avatarUrl?: string;
    }
  ): User {
    ensureSeedUsers();
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw { response: { data: { message: 'User not found.' } } };

    users[index] = {
      ...users[index],
      name: data.name ?? users[index].name,
      phone: data.phone ?? users[index].phone,
      address: data.address ?? users[index].address,
      dateOfBirth: data.dateOfBirth ?? users[index].dateOfBirth,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : users[index].avatarUrl,
    };
    saveUsers(users);
    return toPublicUser(users[index]);
  },

  promoteToDoctor(email: string) {
    ensureSeedUsers();
    const users = loadUsers();
    const normalized = email.toLowerCase();
    const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
    if (index === -1) {
      throw { response: { data: { message: 'No account found with this email.' } } };
    }

    const user = users[index];
    if (user.role === 'Admin') {
      throw { response: { data: { message: 'Admin accounts cannot be changed to doctor.' } } };
    }

    if (user.role === 'Doctor') {
      createDoctorProfileStub(user.id, user.name, user.email);
      return {
        message: 'This account is already a doctor. Ask them to log in with the Doctor role.',
        email: user.email,
      };
    }

    users[index] = { ...user, role: 'Doctor' };
    saveUsers(users);
    createDoctorProfileStub(user.id, user.name, user.email);

    return {
      message:
        'Account upgraded to Doctor. User must log out and sign in again with the Doctor role selected.',
      email: user.email,
    };
  },

  syncAvatar(userId: string, avatarUrl: string) {
    return this.updateProfile(userId, { avatarUrl });
  },

  deactivateAccount() {
    ensureSeedUsers();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = token?.replace('mock-token-', '');
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw { response: { data: { message: 'User not found.' } } };
    }
    users[index] = { ...users[index], isActive: false };
    saveUsers(users);
    return { message: 'Your account has been deactivated.' };
  },
};

export const MOCK_DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@medcare.com', password: 'admin123' },
  { role: 'Doctor', email: 'doctor@medcare.com', password: 'doctor123' },
  { role: 'Patient', email: 'patient@medcare.com', password: 'patient123' },
];
