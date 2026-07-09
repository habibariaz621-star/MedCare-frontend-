'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedicalHistory } from '@/store/thunks/profile';
import Pagination from '@/components/common/Pagination';
import { Search, FileText, Heart, Download } from 'lucide-react';
import { downloadPrescriptionPdf } from '@/lib/downloadPrescription';
import type { MedicalRecord } from '@/types';

export default function PatientHistoryPage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { medicalRecords, medicalTotalPages, medicalCurrentPage, loading } = useAppSelector(
    (state) => state.profile
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchMedicalHistory({ search, page, limit: 8 }));
    }, 300);
    return () => clearTimeout(t);
  }, [search, page, dispatch]);

  const handleDownload = (record: MedicalRecord) => {
    downloadPrescriptionPdf(record, authUser?.name ?? 'Patient');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <Heart className="w-4 h-4" />
          Patient
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Manage Medical History</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Redux profile state — view records &amp; download prescription PDF.
        </p>
      </div>

      <div className="relative dashboard-panel p-4">
        <Search className="w-4 h-4 absolute left-7 top-7 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search records..."
          className="w-full pl-9 pr-3 py-2 input-theme text-sm bg-transparent"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Loading records...</p>
      ) : medicalRecords.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-slate-500 dark:text-violet-300/60">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
          No medical records found.
        </div>
      ) : (
        <div className="space-y-4">
          {medicalRecords.map((record) => (
            <div
              key={record._id}
              className="dashboard-panel rounded-xl p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{record.diagnosis}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(record)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
              {record.prescription && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  <span className="font-medium">Prescription:</span> {record.prescription}
                </p>
              )}
              {record.notes && (
                <p className="text-sm text-slate-500 mt-2">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={medicalCurrentPage} totalPages={medicalTotalPages} onPageChange={setPage} />
    </div>
  );
}
