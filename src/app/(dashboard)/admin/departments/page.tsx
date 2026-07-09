'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import Pagination from '@/components/common/Pagination';
import { Search, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { Department } from '@/types';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', headDoctor: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDepartments({ search, page, limit: 8 });
      setDepartments(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchDepartments, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createDepartment(form);
      toast.success('Department created');
      setShowForm(false);
      setForm({ name: '', description: '', headDoctor: '' });
      fetchDepartments();
    } catch {
      toast.error('Failed to create department');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    try {
      await adminService.deleteDepartment(id);
      toast.success('Department deleted');
      fetchDepartments();
    } catch {
      toast.error('Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Departments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Administrator — manage hospital departments and heads.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <div className="relative dashboard-panel p-4">
        <Search className="w-4 h-4 absolute left-7 top-7 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search departments..."
          className="w-full pl-9 pr-3 py-2 input-theme text-sm bg-transparent"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="text-center py-12 text-slate-500">No departments found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="dashboard-panel rounded-xl p-5 flex justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{dept.description || 'No description'}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Head: {dept.headDoctor || 'Unassigned'} · {dept.doctorCount ?? 0} doctors
                </p>
              </div>
              <button
                onClick={() => handleDelete(dept._id)}
                className="self-start p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="glass-card rounded-xl p-6 w-full max-w-md space-y-3"
          >
            <h3 className="font-bold text-lg">New Department</h3>
            {(['name', 'description', 'headDoctor'] as const).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium capitalize">{field.replace(/([A-Z])/, ' $1')}</label>
                <input
                  required={field === 'name'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full mt-1 input-theme px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold">
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
