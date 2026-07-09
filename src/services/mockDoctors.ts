import type { Doctor, DoctorProfileForm, PaginatedResponse } from '@/types';
import { mockAuth } from './mockAuth';

const DOCTORS_KEY = 'medcare_mock_doctors';

export interface MockDoctorRecord extends Doctor {
  userId: string;
  profileComplete: boolean;
  adminApproved: boolean;
}

function loadDoctors(): MockDoctorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DOCTORS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDoctors(doctors: MockDoctorRecord[]) {
  localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
}

function seedDoctors(): MockDoctorRecord[] {
  return [
    {
      _id: 'doc-seed-1',
      userId: 'doctor-1',
      name: 'Sarah Khan',
      email: 'doctor@medcare.com',
      department: 'Cardiology',
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS, FCPS (Cardiology)',
      experienceYears: 10,
      consultationFee: 2500,
      phone: '+92 300 1234567',
      bio: 'Senior cardiologist with 10+ years of experience.',
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      officeStartTime: '09:00',
      officeEndTime: '17:00',
      profileComplete: true,
      adminApproved: true,
    },
  ];
}

function normalizeDoctor(d: MockDoctorRecord): MockDoctorRecord {
  const normalized = {
    ...d,
    officeStartTime: d.officeStartTime || '09:00',
    officeEndTime: d.officeEndTime || '17:00',
  };
  return {
    ...normalized,
    profileComplete: isProfileComplete(normalized),
    adminApproved: normalized.adminApproved ?? false,
  };
}

export function ensureSeedDoctors() {
  const existing = loadDoctors();
  if (existing.length === 0) {
    saveDoctors(seedDoctors());
  } else {
    saveDoctors(existing.map(normalizeDoctor));
  }
}

export function createDoctorProfileStub(userId: string, name: string, email: string) {
  ensureSeedDoctors();
  const doctors = loadDoctors();
  if (doctors.some((d) => d.userId === userId)) return;

  saveDoctors([
    ...doctors,
    {
      _id: `doc-${userId}`,
      userId,
      name,
      email,
      department: '',
      specialization: '',
      qualification: '',
      phone: '',
      bio: '',
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      officeStartTime: '09:00',
      officeEndTime: '17:00',
      profileComplete: false,
      adminApproved: false,
    },
  ]);
}

function isProfileComplete(data: Partial<DoctorProfileForm>): boolean {
  return Boolean(
    data.department?.trim() &&
      data.specialization?.trim() &&
      data.qualification?.trim() &&
      data.officeStartTime?.trim() &&
      data.officeEndTime?.trim() &&
      data.officeStartTime < data.officeEndTime
  );
}

export const mockDoctors = {
  getDoctors(params: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): PaginatedResponse<Doctor> {
    ensureSeedDoctors();
    const page = params.page ?? 1;
    const limit = params.limit ?? 6;
    const search = params.search?.toLowerCase().trim() ?? '';
    const department = params.department?.trim() ?? '';

    let list = loadDoctors().map(normalizeDoctor).filter((d) => d.profileComplete && d.adminApproved);

    if (search) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.specialization?.toLowerCase().includes(search) ||
          d.qualification?.toLowerCase().includes(search)
      );
    }

    if (department) {
      list = list.filter((d) => d.department === department);
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit).map(({ userId: _, profileComplete: __, ...doc }) => doc);

    return { data, totalPages, currentPage: page, total };
  },

  getProfileByUserId(userId: string): MockDoctorRecord | null {
    ensureSeedDoctors();
    const doc = loadDoctors().find((d) => d.userId === userId);
    return doc ? normalizeDoctor(doc) : null;
  },

  getOrCreateProfile(userId: string, name: string, email: string): MockDoctorRecord {
    ensureSeedDoctors();
    const existing = loadDoctors().find((d) => d.userId === userId);
    if (existing) return normalizeDoctor(existing);
    createDoctorProfileStub(userId, name, email);
    return normalizeDoctor(loadDoctors().find((d) => d.userId === userId)!);
  },

  updateProfile(userId: string, data: DoctorProfileForm): MockDoctorRecord {
    ensureSeedDoctors();
    const doctors = loadDoctors();
    const index = doctors.findIndex((d) => d.userId === userId);

    if (index === -1) {
      throw { response: { data: { message: 'Doctor profile not found.' } } };
    }

    const updated: MockDoctorRecord = {
      ...doctors[index],
      department: data.department,
      specialization: data.specialization,
      qualification: data.qualification,
      experienceYears: data.experienceYears,
      consultationFee: data.consultationFee,
      phone: data.phone,
      bio: data.bio,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : doctors[index].avatarUrl,
      availability: data.availability.length ? data.availability : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      officeStartTime: data.officeStartTime,
      officeEndTime: data.officeEndTime,
      profileComplete: isProfileComplete(data),
      adminApproved: doctors[index].adminApproved ?? false,
    };

    doctors[index] = updated;
    saveDoctors(doctors);

    if (data.avatarUrl !== undefined) {
      try {
        mockAuth.syncAvatar(userId, data.avatarUrl);
      } catch {
        /* user record may not exist in mock auth */
      }
    }

    return updated;
  },
};

export const DEPARTMENT_OPTIONS = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'General Medicine',
  'Orthopedics',
  'Neurology',
];

export const AVAILABILITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
