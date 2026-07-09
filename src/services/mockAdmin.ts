import type { Department, DashboardStats, PaginatedResponse, Doctor } from '@/types';
import { mockAuth } from './mockAuth';
import { ensureSeedDoctors, DEPARTMENT_OPTIONS } from './mockDoctors';
import type { MockDoctorRecord } from './mockDoctors';

const DEPARTMENTS_KEY = 'medcare_mock_departments';
const DOCTORS_KEY = 'medcare_mock_doctors';

function loadDepartments(): Department[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDepartments(depts: Department[]) {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(depts));
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

function seedDepartments(): Department[] {
  return [
    {
      _id: 'dept-1',
      name: 'Cardiology',
      description: 'Heart and cardiovascular care',
      headDoctor: 'Dr. Sarah Khan',
      doctorCount: 1,
    },
    {
      _id: 'dept-2',
      name: 'Dermatology',
      description: 'Skin, hair, and nail treatments',
      headDoctor: 'Unassigned',
      doctorCount: 0,
    },
    {
      _id: 'dept-3',
      name: 'Pediatrics',
      description: 'Medical care for infants and children',
      headDoctor: 'Unassigned',
      doctorCount: 0,
    },
    {
      _id: 'dept-4',
      name: 'General Medicine',
      description: 'Primary care and general health',
      headDoctor: 'Unassigned',
      doctorCount: 0,
    },
  ];
}

function ensureSeedDepartments() {
  if (loadDepartments().length === 0) {
    saveDepartments(seedDepartments());
  }
}

function syncDepartmentDoctorCounts() {
  const doctors = loadDoctors();
  const depts = loadDepartments().map((d) => ({
    ...d,
    doctorCount: doctors.filter((doc) => doc.department === d.name).length,
  }));
  saveDepartments(depts);
}

function toDoctorDto(d: MockDoctorRecord): Doctor {
  const { userId: _, profileComplete: __, ...doc } = d;
  return doc;
}

function paginate<T>(list: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: list.slice(start, start + limit),
    totalPages,
    currentPage: page,
    total,
  };
}

export const mockAdmin = {
  getDashboardStats(): DashboardStats {
    ensureSeedDoctors();
    ensureSeedDepartments();
    syncDepartmentDoctorCounts();

    const stats = mockAuth.getUserStats();
    const doctors = loadDoctors();

    return {
      totalPatients: stats.patients,
      totalDoctors: doctors.length,
      totalAppointments: 12,
      pendingAppointments: 3,
      completedAppointments: 7,
      departments: loadDepartments().length,
    };
  },

  getDoctors(params?: { search?: string; department?: string; page?: number; limit?: number }) {
    ensureSeedDoctors();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const search = params?.search?.toLowerCase().trim() ?? '';
    const department = params?.department?.trim() ?? '';

    let list = loadDoctors();

    if (search) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.email.toLowerCase().includes(search) ||
          d.specialization?.toLowerCase().includes(search)
      );
    }
    if (department) {
      list = list.filter((d) => d.department === department);
    }

    const result = paginate(list.map(toDoctorDto), page, limit);
    return result;
  },

  createDoctor(data: {
    name: string;
    email: string;
    department: string;
    specialization?: string;
    password?: string;
  }) {
    ensureSeedDoctors();
    mockAuth.register({
      name: data.name,
      email: data.email,
      password: data.password || 'doctor123',
      role: 'Doctor',
    });

    const doctors = loadDoctors();
    const created = doctors.find((d) => d.email.toLowerCase() === data.email.toLowerCase());
    if (created) {
      const index = doctors.findIndex((d) => d._id === created._id);
      doctors[index] = {
        ...created,
        department: data.department,
        specialization: data.specialization || '',
        qualification: data.specialization ? `MBBS, ${data.specialization}` : 'MBBS',
        profileComplete: Boolean(data.department && data.specialization),
        adminApproved: true,
      };
      saveDoctors(doctors);
    }
    syncDepartmentDoctorCounts();
    return { message: 'Doctor created' };
  },

  deleteDoctor(id: string) {
    ensureSeedDoctors();
    const doctors = loadDoctors();
    const target = doctors.find((d) => d._id === id);
    saveDoctors(doctors.filter((d) => d._id !== id));
    if (target) mockAuth.removeUserByEmail(target.email);
    syncDepartmentDoctorCounts();
    return { message: 'Doctor deleted' };
  },

  promotePatientToDoctor(email: string) {
    return mockAuth.promoteToDoctor(email);
  },

  setDoctorVerification(id: string, adminApproved: boolean) {
    ensureSeedDoctors();
    const doctors = loadDoctors();
    const index = doctors.findIndex((d) => d._id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Doctor not found.' } } };
    }
    if (adminApproved && !doctors[index].profileComplete) {
      throw {
        response: {
          data: { message: 'Doctor must complete their profile before admin verification.' },
        },
      };
    }
    doctors[index] = { ...doctors[index], adminApproved };
    saveDoctors(doctors);
    syncDepartmentDoctorCounts();
    return toDoctorDto(doctors[index]);
  },

  getDepartments(params?: { search?: string; page?: number; limit?: number }) {
    ensureSeedDepartments();
    syncDepartmentDoctorCounts();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const search = params?.search?.toLowerCase().trim() ?? '';

    let list = loadDepartments();
    if (search) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.description?.toLowerCase().includes(search)
      );
    }
    return paginate(list, page, limit);
  },

  createDepartment(data: { name: string; description?: string; headDoctor?: string }) {
    ensureSeedDepartments();
    const depts = loadDepartments();
    if (depts.some((d) => d.name.toLowerCase() === data.name.toLowerCase())) {
      throw { response: { data: { message: 'Department already exists.' } } };
    }
    depts.push({
      _id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      headDoctor: data.headDoctor,
      doctorCount: 0,
    });
    saveDepartments(depts);
    return { message: 'Department created' };
  },

  deleteDepartment(id: string) {
    ensureSeedDepartments();
    saveDepartments(loadDepartments().filter((d) => d._id !== id));
    return { message: 'Department deleted' };
  },

  getReports() {
    ensureSeedDepartments();
    syncDepartmentDoctorCounts();
    const depts = loadDepartments();
    const top = depts.sort((a, b) => (b.doctorCount ?? 0) - (a.doctorCount ?? 0))[0];

    return {
      appointmentsByMonth: [
        { month: 'Jan', count: 8 },
        { month: 'Feb', count: 12 },
        { month: 'Mar', count: 15 },
        { month: 'Apr', count: 10 },
      ],
      patientsByDepartment: depts.map((d) => ({
        department: d.name,
        count: (d.doctorCount ?? 0) * 5 + 3,
      })),
      summary: {
        growthRate: 12,
        avgAppointmentsPerDay: 4,
        topDepartment: top?.name ?? 'N/A',
      },
    };
  },
};

export { DEPARTMENT_OPTIONS };
