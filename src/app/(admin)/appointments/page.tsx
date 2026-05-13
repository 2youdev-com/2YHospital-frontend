'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate } from '@/lib/utils';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import Topbar from '@/components/layout/Topbar';
import { 
  CalendarDays, Eye, RefreshCw, Filter, 
  Clock, CheckCircle2, XCircle, Search, 
  CalendarClock, Plus, AlertCircle, ArrowUpRight
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  ...Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const DATE_OPTIONS = [
  { value: '', label: 'كل الأوقات' },
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true); else setIsLoading(true);
    try {
      const res = await appointmentsService.getAllAppointments({ status: statusFilter || undefined, limit: 100 });
      setAppointments(res.data || []);
    } catch { }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, [statusFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = appointments.filter((a) => {
    if (search && !a.patient?.name?.includes(search) && !a.doctor.name.includes(search)) return false;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (!a.date.startsWith(today)) return false;
    }
    return true;
  });

  const counts = {
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return { cls: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500', label: 'انتظار' };
      case 'CONFIRMED': return { cls: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500', label: 'مؤكد' };
      case 'COMPLETED': return { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', label: 'مكتمل' };
      case 'CANCELLED': return { cls: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500', label: 'ملغي' };
      case 'NO_SHOW': return { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500', label: 'لم يحضر' };
      case 'RESCHEDULED': return { cls: 'bg-purple-50 text-purple-600 border-purple-100', dot: 'bg-purple-500', label: 'مُعاد' };
      default: return { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500', label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f4f7f8] min-h-screen">
        <Topbar title="إدارة المواعيد" />
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
      <Topbar title="إدارة المواعيد الطبية" />
      
      <div className="px-6 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header & Stats Area */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white shadow-sm flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight mb-2">سجل المواعيد</h1>
              <p className="text-sm font-medium text-slate-500">إدارة وجدولة مواعيد المرضى والأطباء بمرونة عالية</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-2xl font-black text-[#115e6e]">{appointments.length}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">الإجمالي</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-2xl font-black text-amber-500">{counts.pending}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">في الانتظار</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-2xl font-black text-emerald-500">{counts.completed}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">مكتمل</p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between">
          <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم المريض أو الطبيب..."
                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2bbcb3]/50 focus:border-[#2bbcb3] transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex gap-4 md:w-auto w-full">
              <div className="relative flex-1 md:w-40">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e6e]" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-[#115e6e]/5 border border-[#115e6e]/10 text-[#115e6e] text-sm font-bold rounded-xl pr-9 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#115e6e]/30 cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 md:w-40 appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
              >
                {DATE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAppointments(true)}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 text-sm font-bold bg-white/80 backdrop-blur-xl border border-white text-slate-600 h-[68px] px-6 rounded-[1.5rem] hover:bg-white hover:text-[#115e6e] transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <Link
              href="/appointments/new"
              className="flex items-center justify-center gap-2 text-sm font-bold bg-[#115e6e] hover:bg-[#0d4753] text-white h-[68px] px-6 rounded-[1.5rem] transition-all shadow-lg shadow-[#115e6e]/20"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">حجز موعد</span>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
            <h2 className="text-base font-black text-[#115e6e] flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              الجدول الزمني للمواعيد
            </h2>
            {(search || statusFilter || dateFilter) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); setDateFilter(''); }}
                className="text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-full transition-colors"
              >
                مسح الفلاتر
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد مواعيد</h3>
              <p className="text-sm font-medium text-slate-400">
                {search || statusFilter || dateFilter ? 'لم يتم العثور على نتائج تطابق معايير البحث.' : 'لم يتم تسجيل أي مواعيد بعد.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">بيانات المريض</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">الطبيب المعالج</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 hidden md:table-cell">التاريخ والوقت</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">حالة الموعد</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 w-20">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((appt) => {
                    const statusStyle = getStatusStyle(appt.status);
                    
                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-[#115e6e]/10 group-hover:scale-105 transition-transform">
                              {appt.patient?.name?.[0] ?? 'م'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 mb-0.5 group-hover:text-[#115e6e] transition-colors">
                                {appt.patient?.name || <span className="text-slate-300">غير مسجل</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{appt.doctor.name}</p>
                          <p className="text-[11px] font-bold text-[#2bbcb3] mt-0.5">{appt.doctor.specialty}</p>
                        </td>

                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg self-start">
                              {formatDate(appt.date)}
                            </span>
                            <span className="text-sm font-black text-[#115e6e] font-mono" dir="ltr">
                              {appt.time}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${statusStyle.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/appointments/${appt.id}`}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-[#115e6e] hover:text-white hover:border-[#115e6e] transition-all shadow-sm"
                            title="التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
