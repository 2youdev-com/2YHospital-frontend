'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { LoadingSpinner, EmptyState, Select, SearchBar } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { CalendarDays, ChevronLeft, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  ...Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    appointmentsService.getTodaySchedule()
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search && !a.patient?.name?.includes(search)) return false;
    return true;
  });

  const groupedByDate = filtered.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const date = appt.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="مواعيدي" />
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">مواعيدي</h1>
          <p className="text-sm text-gray-500 mt-0.5">{appointments.length} موعد</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <SearchBar value={search} onChange={setSearch} placeholder="بحث باسم المريض..." />
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="w-44" />
        </div>

        {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="لا توجد مواعيد" icon={CalendarDays} />
        ) : (
          Object.entries(groupedByDate).sort().map(([date, appts]) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                {formatDate(date, 'EEEE، dd MMMM yyyy')}
              </p>
              <div className="space-y-2">
                {appts.map((appt) => (
                  <Link key={appt.id} href={`/portal/appointments/${appt.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 p-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {appt.patient?.name?.[0] ?? 'م'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{appt.patient?.name ?? 'مريض'}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span dir="ltr">{appt.time}</span>
                          {appt.type && <span>· {appt.type}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
                        <ChevronLeft className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
