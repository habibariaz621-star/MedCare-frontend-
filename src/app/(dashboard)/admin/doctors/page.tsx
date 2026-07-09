'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import Pagination from '@/components/common/Pagination';
import PasswordInput from '@/components/auth/PasswordInput';
import { Search, Plus, Trash2, BadgeCheck, UserCog, ShieldX } from 'lucide-react';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiError';
import type { Doctor } from '@/types';

function doctorStatus(doc: Doctor) {
  if (doc.adminApproved) return { label: 'Verified', className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' };
  if (doc.profileComplete) return { label: 'Pending review', className: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40' };
  return { label: 'Incomplete profile', className: 'text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/50' };
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    specialization: '',
    password: '',
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDoctors({ search, department, page, limit: 8 });
      setDoctors(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(t);
  }, [search, department, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createDoctor(form);
      toast.success('Doctor added and verified by admin');
      setShowForm(false);
      setForm({ name: '', email: '', department: '', specialization: '', password: '' });
      fetchDoctors();
    } catch {
      toast.error('Failed to add doctor');
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    setPromoting(true);
    try {
      const result = await adminService.promotePatientToDoctor(promoteEmail.trim());
      toast.success(result.message ?? 'Patient promoted to doctor');
      setPromoteEmail('');
      fetchDoctors();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Could not promote account'));
    } finally {
      setPromoting(false);
    }
  };

  const handleVerification = async (id: string, adminApproved: boolean) => {
    try {
      await adminService.setDoctorVerification(id, adminApproved);
      toast.success(adminApproved ? 'Doctor verified' : 'Verification removed');
      fetchDoctors();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Action failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await adminService.deleteDoctor(id);
      toast.success('Doctor removed');
      fetchDoctors();
    } catch {
      toast.error('Failed to delete doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Doctors</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Verify doctors, promote patients who registered with the wrong role, and manage clinic staff.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      <form
        onSubmit={handlePromote}
        className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-end"
      >
        <div className="flex-1">
          <label className="text-sm font-semibold text-violet-900 dark:text-violet-200 flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Patient registered as Doctor by mistake?
          </label>
          <p className="text-xs text-violet-700/80 dark:text-violet-300/70 mt-1 mb-2">
            Enter their registered email to upgrade the account to Doctor. They must log out and sign in with the Doctor role.
          </p>
          <input
            type="email"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="patient@email.com"
            className="w-full border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-2 text-sm bg-white/90 dark:bg-violet-950/40"
          />
        </div>
        <button
          type="submit"
          disabled={promoting || !promoteEmail.trim()}
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {promoting ? 'Upgrading...' : 'Promote to Doctor'}
        </button>
      </form>

      <div className="flex flex-col md:flex-row gap-3 dashboard-panel p-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search doctors..."
            className="w-full pl-9 pr-3 py-2 input-theme text-sm bg-transparent"
          />
        </div>
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="input-theme px-3 py-2 text-sm bg-transparent"
        >
          <option value="">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="General Medicine">General Medicine</option>
        </select>
      </div>

      <div className="dashboard-panel rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : doctors.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No doctors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="dashboard-table-head">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctors.map((doc) => {
                  const status = doctorStatus(doc);
                  return (
                    <tr key={doc._id}>
                      <td className="p-4 font-medium">Dr. {doc.name}</td>
                      <td className="p-4 text-slate-500">{doc.email}</td>
                      <td className="p-4">{doc.department}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {doc.profileComplete && !doc.adminApproved && (
                          <button
                            onClick={() => handleVerification(doc._id, true)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                            title="Verify doctor"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        )}
                        {doc.adminApproved && (
                          <button
                            onClick={() => handleVerification(doc._id, false)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                            title="Remove verification"
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="glass-card rounded-xl p-6 w-full max-w-md space-y-3"
          >
            <h3 className="font-bold text-lg">Add New Doctor</h3>
            {Object.entries({
              name: 'Name',
              email: 'Email',
              department: 'Department',
              specialization: 'Specialization',
              password: 'Password',
            }).map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                {key === 'password' ? (
                  <PasswordInput
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    inputClassName="w-full mt-1 input-theme"
                    className="mt-1"
                  />
                ) : (
                  <input
                    required={key !== 'specialization'}
                    type={key === 'email' ? 'email' : 'text'}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full mt-1 input-theme"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
