// src/app/(admin)/appointments/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate } from '@/lib/utils';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/constants';
import { LoadingSpinner, SearchBar, Select, EmptyState, Badge } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { CalendarDays, Eye, RefreshCw, Filter, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
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

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${color}`}>
      <span className="text-lg font-bold tabular-nums">{count}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
}

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

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="المواعيد" />
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">إدارة المواعيد</h1>
            <p className="text-sm text-gray-500 mt-0.5">{appointments.length} موعد إجمالاً</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchAppointments(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <Link
              href="/appointments/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              موعد جديد
            </Link>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex gap-3 flex-wrap">
          <SummaryChip label="قيد الانتظار" count={counts.pending} color="bg-amber-50 text-amber-700" />
          <SummaryChip label="مؤكدة" count={counts.confirmed} color="bg-blue-50 text-blue-700" />
          <SummaryChip label="مكتملة" count={counts.completed} color="bg-emerald-50 text-emerald-700" />
          <SummaryChip label="ملغية" count={counts.cancelled} color="bg-red-50 text-red-700" />
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-52">
            <SearchBar value={search} onChange={setSearch} placeholder="بحث بالمريض أو الطبيب..." />
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="w-40" />
          <Select value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} className="w-36" />
          {(search || statusFilter || dateFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setDateFilter(''); }}
              className="text-xs text-gray-400 hover:text-red-500 px-2"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="لا توجد مواعيد"
              description={search || statusFilter ? 'لا توجد نتائج مطابقة، جرب تغيير الفلاتر' : 'لم يتم تسجيل أي مواعيد بعد'}
              icon={CalendarDays}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">المريض</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">الطبيب</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">التخصص</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">التاريخ</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">الوقت</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                    <th className="px-5 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((appt) => (
                    <tr key={appt.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {appt.patient?.name?.[0] ?? 'م'}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{appt.patient?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700 font-medium">{appt.doctor.name}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{appt.doctor.specialty}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(appt.date)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono font-medium text-gray-700" dir="ltr">{appt.time}</span>
                      </td>
                      <td className="px-5 py-4">
                        <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/appointments/${appt.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  عرض {filtered.length} من {appointments.length} موعد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}