export type UserRole = 'Admin' | 'Doctor' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  department: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  availability?: string[];
  officeStartTime?: string;
  officeEndTime?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  profileComplete?: boolean;
  adminApproved?: boolean;
  userId?: string;
}

export interface DoctorProfileForm {
  department: string;
  specialization: string;
  qualification: string;
  experienceYears?: number;
  consultationFee?: number;
  phone: string;
  bio: string;
  availability: string[];
  officeStartTime: string;
  officeEndTime: string;
  avatarUrl?: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  headDoctor?: string;
  doctorCount?: number;
}

export interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';
  reason?: string;
  cancellationReason?: string;
  doctorId?: Doctor | string;
  patientId?: User | { name: string; email: string; _id?: string };
}

export interface MedicalRecord {
  _id: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  date: string;
  doctorId?: Doctor | string;
  doctorName?: string;
  patientId?: string;
}

export interface Review {
  _id: string;
  appointmentId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  doctorId?: Doctor | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total?: number;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  departments: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
