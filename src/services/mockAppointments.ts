import type { Appointment, MedicalRecord, PaginatedResponse } from '@/types';
import { ensureSeedDoctors, mockDoctors } from './mockDoctors';

const APPOINTMENTS_KEY = 'medcare_mock_appointments';
const NOTES_KEY = 'medcare_mock_consultation_notes';

interface StoredAppointment extends Appointment {
  doctorId: string;
  patientId: { _id: string; name: string; email: string; phone?: string };
}

interface StoredNote extends MedicalRecord {
  patientId: string;
  doctorUserId: string;
}

function todayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function loadAppointments(): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAppointments(list: StoredAppointment[]) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
}

function loadNotes(): StoredNote[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveNotes(list: StoredNote[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(list));
}

function seedAppointments(): StoredAppointment[] {
  return [
    {
      _id: 'appt-seed-1',
      doctorId: 'doc-seed-1',
      patientId: {
        _id: 'patient-1',
        name: 'John Patient',
        email: 'patient@medcare.com',
        phone: '+92 321 5550101',
      },
      date: todayOffset(0),
      timeSlot: '10:00 AM',
      status: 'Pending',
      reason: 'Chest discomfort and follow-up',
    },
    {
      _id: 'appt-seed-2',
      doctorId: 'doc-seed-1',
      patientId: {
        _id: 'patient-1',
        name: 'John Patient',
        email: 'patient@medcare.com',
        phone: '+92 321 5550101',
      },
      date: todayOffset(1),
      timeSlot: '02:00 PM',
      status: 'Approved',
      reason: 'Routine cardiac checkup',
    },
    {
      _id: 'appt-seed-3',
      doctorId: 'doc-seed-1',
      patientId: {
        _id: 'patient-2',
        name: 'Ayesha Malik',
        email: 'ayesha@example.com',
        phone: '+92 300 9876543',
      },
      date: todayOffset(2),
      timeSlot: '11:30 AM',
      status: 'Approved',
      reason: 'Blood pressure monitoring',
    },
    {
      _id: 'appt-seed-4',
      doctorId: 'doc-seed-1',
      patientId: {
        _id: 'patient-1',
        name: 'John Patient',
        email: 'patient@medcare.com',
        phone: '+92 321 5550101',
      },
      date: todayOffset(-14),
      timeSlot: '11:00 AM',
      status: 'Completed',
      reason: 'General health checkup',
    },
    {
      _id: 'appt-seed-5',
      doctorId: 'doc-seed-1',
      patientId: {
        _id: 'patient-2',
        name: 'Ayesha Malik',
        email: 'ayesha@example.com',
        phone: '+92 300 9876543',
      },
      date: todayOffset(0),
      timeSlot: '03:00 PM',
      status: 'Pending',
      reason: 'ECG report discussion',
    },
  ];
}

function ensureSeedNotes() {
  const notes = loadNotes();
  if (notes.length === 0) {
    saveNotes([
      {
        _id: 'note-seed-1',
        patientId: 'patient-1',
        doctorUserId: 'doctor-1',
        diagnosis: 'Mild hypertension — under observation',
        prescription: 'Amlodipine 5mg once daily',
        notes: 'Follow up in 4 weeks. Reduce salt intake.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }
}

function enrichWithDoctor(appointment: StoredAppointment): Appointment {
  ensureSeedDoctors();
  const doctor = mockDoctors.getDoctors({ limit: 100 }).data.find((d) => d._id === appointment.doctorId);
  return {
    ...appointment,
    doctorId: doctor ?? appointment.doctorId,
  };
}
function ensureSeedAppointments() {
  ensureSeedNotes();
  const existing = loadAppointments();
  if (existing.length === 0) {
    saveAppointments(seedAppointments());
  }
}

function resolveDoctorId(doctorUserId: string): string | null {
  ensureSeedDoctors();
  const profile = mockDoctors.getProfileByUserId(doctorUserId);
  return profile?._id ?? null;
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

export const mockAppointments = {
  getDoctorSchedule(
    doctorUserId: string,
    params?: { search?: string; status?: string; page?: number; limit?: number }
  ): PaginatedResponse<Appointment> {
    ensureSeedAppointments();
    const doctorId = resolveDoctorId(doctorUserId);
    if (!doctorId) return { data: [], totalPages: 1, currentPage: 1, total: 0 };

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const search = params?.search?.toLowerCase().trim() ?? '';
    const status = params?.status?.trim() ?? '';

    let list = loadAppointments().filter((a) => a.doctorId === doctorId);

    if (search) {
      list = list.filter(
        (a) =>
          a.patientId.name.toLowerCase().includes(search) ||
          a.patientId.email.toLowerCase().includes(search)
      );
    }

    if (status) {
      list = list.filter((a) => a.status === status);
    }

    list.sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
    return paginate(list, page, limit);
  },

  updateAppointmentStatus(appointmentId: string, status: 'Approved' | 'Rejected') {
    ensureSeedAppointments();
    const list = loadAppointments();
    const index = list.findIndex((a) => a._id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');
    list[index] = { ...list[index], status };
    saveAppointments(list);
    return list[index];
  },

  completeAppointment(appointmentId: string) {
    ensureSeedAppointments();
    const list = loadAppointments();
    const index = list.findIndex((a) => a._id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');
    if (list[index].status !== 'Approved') {
      throw { response: { data: { message: 'Only approved appointments can be marked completed' } } };
    }
    list[index] = { ...list[index], status: 'Completed' };
    saveAppointments(list);
    return list[index];
  },

  getDoctorPatients(
    doctorUserId: string,
    params?: { search?: string; page?: number; limit?: number }
  ) {
    ensureSeedAppointments();
    const doctorId = resolveDoctorId(doctorUserId);
    if (!doctorId) return { data: [], totalPages: 1, currentPage: 1, total: 0 };

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const search = params?.search?.toLowerCase().trim() ?? '';

    const seen = new Map<string, { _id: string; name: string; email: string; phone?: string }>();
    loadAppointments()
      .filter((a) => a.doctorId === doctorId && a.status !== 'Rejected')
      .forEach((a) => {
        if (!seen.has(a.patientId._id)) {
          seen.set(a.patientId._id, a.patientId);
        }
      });

    let patients = Array.from(seen.values());
    if (search) {
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search) || p.email.toLowerCase().includes(search)
      );
    }

    return paginate(patients, page, limit);
  },

  addConsultationNote(
    doctorUserId: string,
    patientId: string,
    data: { diagnosis: string; prescription?: string; notes?: string }
  ) {
    const notes = loadNotes();
    const note: StoredNote = {
      _id: `note-${Date.now()}`,
      patientId,
      doctorUserId,
      diagnosis: data.diagnosis,
      prescription: data.prescription,
      notes: data.notes,
      date: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    return note;
  },

  getPatientRecords(doctorUserId: string, patientId: string) {
    return loadNotes()
      .filter((n) => n.patientId === patientId)
      .map((n) => {
        const profile = mockDoctors.getProfileByUserId(n.doctorUserId);
        return {
          _id: n._id,
          diagnosis: n.diagnosis,
          prescription: n.prescription,
          notes: n.notes,
          date: n.date,
          patientId: n.patientId,
          doctorName: profile?.name ?? 'Doctor',
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getPatientVisitHistory(doctorUserId: string, patientId: string) {
    ensureSeedAppointments();
    const doctorId = resolveDoctorId(doctorUserId);
    if (!doctorId) return [];

    return loadAppointments()
      .filter((a) => a.doctorId === doctorId && a.patientId._id === patientId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot))
      .map(enrichWithDoctor);
  },

  createAppointment(
    patientUserId: string,
    patientName: string,
    patientEmail: string,
    data: { doctorId: string; date: string; timeSlot: string; reason?: string }
  ) {
    ensureSeedAppointments();
    const list = loadAppointments();
    const appointment: StoredAppointment = {
      _id: `appt-${Date.now()}`,
      doctorId: data.doctorId,
      patientId: {
        _id: patientUserId,
        name: patientName,
        email: patientEmail,
      },
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'Pending',
      reason: data.reason,
    };
    saveAppointments([...list, appointment]);
    return appointment;
  },

  getPatientAppointments(
    patientUserId: string,
    params?: { search?: string; status?: string; page?: number; limit?: number }
  ): PaginatedResponse<Appointment> {
    ensureSeedAppointments();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const search = params?.search?.toLowerCase().trim() ?? '';
    const status = params?.status?.trim() ?? '';

    let list = loadAppointments().filter((a) => a.patientId._id === patientUserId);

    if (search) {
      list = list.filter((a) => a.reason?.toLowerCase().includes(search) ?? false);
    }
    if (status) {
      list = list.filter((a) => a.status === status);
    }

    list.sort((a, b) => b.date.localeCompare(a.date));
    const enriched = list.map(enrichWithDoctor);
    return paginate(enriched, page, limit);
  },

  getPatientMedicalHistory(
    patientUserId: string,
    params?: { search?: string; page?: number; limit?: number }
  ): PaginatedResponse<MedicalRecord> {
    ensureSeedNotes();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const search = params?.search?.toLowerCase().trim() ?? '';

    let list = loadNotes().filter((n) => n.patientId === patientUserId);

    if (search) {
      list = list.filter(
        (n) =>
          n.diagnosis.toLowerCase().includes(search) ||
          n.prescription?.toLowerCase().includes(search) ||
          n.notes?.toLowerCase().includes(search)
      );
    }

    list.sort((a, b) => b.date.localeCompare(a.date));
    return paginate(list, page, limit);
  },

  cancelAppointment(appointmentId: string, cancellationReason?: string) {
    const list = loadAppointments();
    const index = list.findIndex((a) => a._id === appointmentId);
    if (index === -1) throw new Error('Not found');
    list[index] = {
      ...list[index],
      status: 'Cancelled',
      cancellationReason: cancellationReason?.trim() || list[index].cancellationReason,
    };
    saveAppointments(list);
    return enrichWithDoctor(list[index]);
  },

  rescheduleAppointment(appointmentId: string, data: { date: string; timeSlot: string }) {
    const list = loadAppointments();
    const index = list.findIndex((a) => a._id === appointmentId);
    if (index === -1) throw new Error('Not found');
    list[index] = { ...list[index], date: data.date, timeSlot: data.timeSlot, status: 'Pending' };
    saveAppointments(list);
    return list[index];
  },
};
