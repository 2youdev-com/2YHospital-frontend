'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { LoadingSpinner, EmptyState, Select, SearchBar } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { 
  CalendarDays, ChevronLeft, Clock, Search, 
  Filter, Sparkles, User, Activity, 
  CalendarClock, CheckCircle2, Zap
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import type { Appointment, AppointmentStatus } from '@/types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  ...Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    appointmentsService.getTodaySchedule()
      .then(setAppointments)
      .catch(() => toast.error('فشل تحميل المواعيد'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search && !a.patient?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedByDate = filtered.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const date = appt.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  const counts = {
    total: filtered.length,
    completed: filtered.filter(a => a.status === 'COMPLETED').length,
    pending: filtered.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length,
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="سجل المواعيد" />
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-32 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="h-16 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة مواعيد المرضى" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Header Hero */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <CalendarClock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight mb-2">جدول المواعيد</h1>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  الإجمالي: {counts.total}
                </span>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  مكتملة: {counts.completed}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-100 px-5 py-3 rounded-2xl shadow-sm text-center">
              <p className="text-xl font-black text-[#115e6e] tabular-nums">{counts.pending}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase">قيد الانتظار</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المريض..."
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2bbcb3]/50 focus:border-[#2bbcb3] transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative md:w-56">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e6e]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#115e6e]/5 border border-[#115e6e]/10 text-[#115e6e] text-sm font-bold rounded-xl pr-9 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#115e6e]/30 cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Appointments List */}
        {filtered.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800">لا توجد مواعيد للعرض</h3>
            <p className="text-sm font-medium text-slate-400 mt-2">جرب تغيير كلمات البحث أو مسح الفلاتر المختارة.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedByDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, appts]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="h-0.5 flex-1 bg-gradient-to-l from-slate-200 to-transparent" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    {formatDate(date, 'EEEE، dd MMMM yyyy')}
                  </p>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {appts.map((appt) => (
                    <Link key={appt.id} href={`/portal/appointments/${appt.id}`}>
                      <div className="group relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex items-center gap-5 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                              {appt.patient?.name?.[0] ?? 'م'}
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-800 group-hover:text-[#115e6e] transition-colors">
                                {appt.patient?.name ?? 'مريض'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span dir="ltr">{appt.time}</span>
                                </span>
                                {appt.type && (
                                  <span className="text-xs font-bold text-[#2bbcb3] flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5" />
                                    {appt.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                            <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-[#115e6e] group-hover:text-white transition-all">
                              <ChevronLeft className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - إدارة المواعيد السريرية الذكية</span>
        </div>

      </div>
    </div>
  );
}
