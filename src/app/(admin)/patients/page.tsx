// src/app/(admin)/patients/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { LoadingSpinner, SearchBar, EmptyState, Badge, Select } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import {
  Users, Eye, Phone, Calendar, ShieldOff, ShieldCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient } from '@/types';

const GENDER_OPTIONS = [
  { value: '', label: 'كل الأجناس' },
  { value: 'MALE', label: 'ذكر' },
  { value: 'FEMALE', label: 'أنثى' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'موقوف' },
];

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${color}`}>
      <span className="text-lg font-bold tabular-nums">{count}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({ role: 'PATIENT', limit: 200 });
      setPatients(res.data ?? []);
    } catch {
      toast.error('فشل تحميل قائمة المرضى');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleToggleStatus = async (patient: Patient) => {
    setTogglingId(patient.id);
    try {
      await adminService.toggleUserStatus(patient.id);
      setPatients((prev) =>
        prev.map((p) => p.id === patient.id ? { ...p, isActive: !p.isActive } : p)
      );
      toast.success(patient.isActive ? 'تم تعليق الحساب' : 'تم تفعيل الحساب');
    } catch {
      toast.error('فشل تغيير الحالة');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.name?.toLowerCase().includes(q) && !p.phone?.includes(q) && !p.mrn?.toLowerCase().includes(q)) return false;
    if (genderFilter && p.gender !== genderFilter) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    return true;
  });

  const activeCount = patients.filter((p) => p.isActive).length;
  const maleCount = patients.filter((p) => p.gender === 'MALE').length;
  const femaleCount = patients.filter((p) => p.gender === 'FEMALE').length;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="المرضى" />

      <div className="p-6 space-y-5">
        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <SummaryChip label="إجمالي المرضى" count={patients.length} color="bg-blue-50 text-blue-700 border border-blue-100" />
          <SummaryChip label="نشط" count={activeCount} color="bg-emerald-50 text-emerald-700 border border-emerald-100" />
          <SummaryChip label="موقوف" count={patients.length - activeCount} color="bg-red-50 text-red-600 border border-red-100" />
          <SummaryChip label="ذكور" count={maleCount} color="bg-indigo-50 text-indigo-700 border border-indigo-100" />
          <SummaryChip label="إناث" count={femaleCount} color="bg-pink-50 text-pink-700 border border-pink-100" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="ابحث بالاسم أو الجوال أو رقم الملف..."
              />
            </div>
            <Select value={genderFilter} onChange={setGenderFilter} options={GENDER_OPTIONS} className="w-36" />
            <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="w-36" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              قائمة المرضى
              <span className="text-xs font-normal text-gray-400 mr-1">
                ({filtered.length} من {patients.length})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="لا يوجد مرضى"
              description="لم يتم العثور على مرضى مطابقين لمعايير البحث"
              icon={Users}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-right">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">المريض</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">رقم الجوال</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">الجنس</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">تاريخ الميلاد</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">رقم الملف</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">الحالة</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {patient.name?.[0] ?? 'م'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {patient.name || <span className="text-gray-400 italic text-xs">غير مكتمل</span>}
                            </p>
                            {patient.bloodType && (
                              <span className="text-xs text-red-500 font-medium">فصيلة {patient.bloodType}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {patient.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          patient.gender === 'MALE'
                            ? 'bg-indigo-50 text-indigo-700'
                            : patient.gender === 'FEMALE'
                            ? 'bg-pink-50 text-pink-700'
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                          {patient.mrn ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={patient.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}>
                          {patient.isActive ? 'نشط' : 'موقوف'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="عرض الملف الكامل"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(patient)}
                            disabled={togglingId === patient.id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              patient.isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={patient.isActive ? 'تعليق الحساب' : 'تفعيل الحساب'}
                          >
                            {patient.isActive
                              ? <ShieldOff className="w-4 h-4" />
                              : <ShieldCheck className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}