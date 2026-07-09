'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { doctorService } from '@/services/doctor.service';
import Pagination from '@/components/common/Pagination';
import { Search, FileText, User, Stethoscope, Calendar, Clock, History } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { Appointment, MedicalRecord } from '@/types';

interface PatientItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function DoctorPatientsPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [visitHistory, setVisitHistory] = useState<Appointment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [noteForm, setNoteForm] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [showNoteForm, setShowNoteForm] = useState(false);

  const fetchPatients = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const res = await doctorService.getPatients(authUser.id, { search, page, limit: 8 });
      setPatients(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchPatients, 300);
    return () => clearTimeout(t);
  }, [search, page, authUser]);

  const openPatient = async (patient: PatientItem) => {
    if (!authUser?.id) return;
    setSelectedPatient(patient);
    setShowNoteForm(false);
    setNoteForm({ diagnosis: '', prescription: '', notes: '' });
    setHistoryLoading(true);
    try {
      const [records, visits] = await Promise.all([
        doctorService.getPatientRecords(authUser.id, patient._id),
        doctorService.getPatientVisitHistory(authUser.id, patient._id),
      ]);
      setPatientRecords(records ?? []);
      setVisitHistory(visits ?? []);
    } catch {
      setPatientRecords([]);
      setVisitHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !authUser?.id) return;
    try {
      await doctorService.addConsultationNote(authUser.id, selectedPatient._id, noteForm);
      toast.success('Consultation note saved');
      const [records, visits] = await Promise.all([
        doctorService.getPatientRecords(authUser.id, selectedPatient._id),
        doctorService.getPatientVisitHistory(authUser.id, selectedPatient._id),
      ]);
      setPatientRecords(records ?? []);
      setVisitHistory(visits ?? []);
      setShowNoteForm(false);
      setNoteForm({ diagnosis: '', prescription: '', notes: '' });
    } catch {
      toast.error('Failed to save note');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Stethoscope className="w-4 h-4" />
          Doctor
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Patient Records</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View visit history, past medical records, and add new consultation notes.
        </p>
      </div>

      <div className="relative dashboard-panel p-4">
        <Search className="w-4 h-4 absolute left-7 top-7 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search patients..."
          className="w-full pl-9 pr-3 py-2 input-theme text-sm bg-transparent"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Loading patients...</p>
      ) : patients.length === 0 ? (
        <p className="text-slate-500">No patients found. Patients appear here after booking with you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((patient) => (
            <button
              key={patient._id}
              type="button"
              onClick={() => openPatient(patient)}
              className="text-left dashboard-panel rounded-xl p-5 hover:border-violet-400 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{patient.name}</h3>
                  <p className="text-sm text-slate-500">{patient.email}</p>
                  {patient.phone && <p className="text-sm text-slate-500">{patient.phone}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div>
              <h3 className="font-bold text-lg">{selectedPatient.name}</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-1">
                <p>Email: {selectedPatient.email}</p>
                {selectedPatient.phone && <p>Phone: {selectedPatient.phone}</p>}
              </div>
            </div>

            {historyLoading ? (
              <p className="text-sm text-slate-500">Loading patient history...</p>
            ) : (
              <>
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-500" />
                    Visit History (with you)
                  </h4>
                  {visitHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No visits recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {visitHistory.map((visit) => (
                        <li
                          key={visit._id}
                          className="text-sm input-theme p-3"
                        >
                          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(visit.date).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {visit.timeSlot}
                            </span>
                            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                              {visit.status}
                            </span>
                          </div>
                          {visit.reason && (
                            <p className="text-xs text-slate-500 mt-1">Reason: {visit.reason}</p>
                          )}
                          {visit.cancellationReason && (
                            <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-1">
                              Cancelled: {visit.cancellationReason}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-500" />
                    Medical History (all records)
                  </h4>
                  {patientRecords.length === 0 ? (
                    <p className="text-sm text-slate-500">No medical records yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {patientRecords.map((record) => (
                        <li
                          key={record._id}
                          className="text-sm input-theme p-3"
                        >
                          <div className="flex justify-between gap-2">
                            <p className="font-medium">{record.diagnosis}</p>
                            <p className="text-xs text-slate-400 shrink-0">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                          {record.doctorName && (
                            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                              Dr. {record.doctorName}
                            </p>
                          )}
                          {record.prescription && (
                            <p className="text-slate-500 mt-1">Rx: {record.prescription}</p>
                          )}
                          {record.notes && <p className="text-slate-500 mt-1">{record.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {!showNoteForm ? (
              <button
                type="button"
                onClick={() => setShowNoteForm(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline"
              >
                <FileText className="w-4 h-4" />
                Add Consultation Note
              </button>
            ) : (
              <form onSubmit={handleAddNote} className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-sm">New Consultation Note</h4>
                {(['diagnosis', 'prescription', 'notes'] as const).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium capitalize">{field}</label>
                    <textarea
                      required={field === 'diagnosis'}
                      rows={field === 'notes' ? 3 : 2}
                      value={noteForm[field]}
                      onChange={(e) => setNoteForm({ ...noteForm, [field]: e.target.value })}
                      className="w-full mt-1 input-theme px-3 py-2 text-sm"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="flex-1 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">
                    Save Note
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="w-full py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
