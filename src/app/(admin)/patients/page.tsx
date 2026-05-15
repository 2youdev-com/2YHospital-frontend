'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import Topbar from '@/components/layout/Topbar';
import {
  Users, Eye, Phone, Calendar, ShieldOff, ShieldCheck,
  Search, Filter, Activity, ArrowUpRight, ActivitySquare,
  UserCheck, UserX, UserSquare2, UserPlus
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient } from '@/types';

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
      const data = await adminService.getUsers({ role: 'PATIENT', limit: 200 });
      setPatients(data ?? []);
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

  if (isLoading) {
    return (
      <div className="bg-[#f4f7f8] min-h-screen">
        <Topbar title="إدارة المرضى" />
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="h-32 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="h-16 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="h-96 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-10">
      <Topbar title="إدارة المرضى والمراجعين" />

      <div className="px-6 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header & Stats Area */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white shadow-sm flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight mb-2">سجل المرضى</h1>
              <p className="text-sm font-medium text-slate-500">إدارة ومتابعة سجلات المرضى والملفات الطبية</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Link 
              href="/patients/new" 
              className="flex items-center gap-2 bg-[#115e6e] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-[#115e6e]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-5 h-5" />
              إضافة مريض جديد
            </Link>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                <UserSquare2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-0.5">إجمالي المرضى</p>
                <p className="text-xl font-black text-slate-700">{patients.length}</p>
              </div>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-0.5">ملفات نشطة</p>
                <p className="text-xl font-black text-emerald-600">{activeCount}</p>
              </div>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-0.5">ملفات موقوفة</p>
                <p className="text-xl font-black text-rose-500">{patients.length - activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، أو رقم الملف (MRN)..."
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2bbcb3]/50 focus:border-[#2bbcb3] transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-4 md:w-auto w-full">
            <div className="relative flex-1 md:w-40">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e6e]" />
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full appearance-none bg-[#115e6e]/5 border border-[#115e6e]/10 text-[#115e6e] text-sm font-bold rounded-xl pr-9 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#115e6e]/30 cursor-pointer"
              >
                <option value="">كل الأجناس</option>
                <option value="MALE">ذكر</option>
                <option value="FEMALE">أنثى</option>
              </select>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-40 appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">موقوف فقط</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
            <h2 className="text-base font-black text-[#115e6e] flex items-center gap-2">
              <ActivitySquare className="w-5 h-5" />
              الجدول الزمني للمرضى
            </h2>
            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              يعرض {filtered.length} نتيجة
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-1">لا يوجد مرضى مطابقين</h3>
              <p className="text-sm font-medium text-slate-400">حاول البحث باستخدام كلمات أخرى أو تفريغ الفلاتر.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">الاسم والملف</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">معلومات الاتصال</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">التركيبة</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">الحالة</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 w-24">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-[#115e6e]/10 group-hover:scale-105 transition-transform">
                            {patient.name?.[0] ?? 'م'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 mb-0.5 group-hover:text-[#115e6e] transition-colors">
                              {patient.name || <span className="text-slate-300">غير مسجل</span>}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                                #{patient.mrn ?? 'N/A'}
                              </span>
                              {patient.bloodType && (
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                  {patient.bloodType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            {patient.phone}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex self-start text-[10px] font-bold px-2 py-1 rounded-lg ${
                            patient.gender === 'MALE'
                              ? 'bg-blue-50 text-blue-600'
                              : patient.gender === 'FEMALE'
                              ? 'bg-fuchsia-50 text-fuchsia-600'
                              : 'bg-slate-50 text-slate-500'
                          }`}>
                            {patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : 'غير محدد'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          patient.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${patient.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {patient.isActive ? 'حساب نشط' : 'موقوف'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-[#115e6e] hover:text-white hover:border-[#115e6e] transition-all shadow-sm"
                            title="عرض الملف الكامل"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(patient)}
                            disabled={togglingId === patient.id}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-50 shadow-sm ${
                              patient.isActive
                                ? 'bg-white border-slate-200 text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                            }`}
                            title={patient.isActive ? 'تعليق الحساب' : 'تفعيل الحساب'}
                          >
                            {togglingId === patient.id ? (
                              <Activity className="w-4 h-4 animate-spin" />
                            ) : patient.isActive ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
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
