'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { doctorsService } from '@/services/doctors.service';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { CalendarDays, Clock, CheckCircle2, ChevronLeft, Bot, Stethoscope, Users } from 'lucide-react';
import type { Appointment, Doctor } from '@/types';

export default function DoctorPortalPage() {
  const { user } = useAuth();
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور';

  useEffect(() => {
    Promise.all([
      appointmentsService.getTodaySchedule(),
      doctorsService.getMyProfile(),
    ])
      .then(([appts, doc]) => { setTodayAppts(appts); setProfile(doc); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const completed = todayAppts.filter(a => a.status === 'COMPLETED').length;
  const pending = todayAppts.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
  const nextAppt = todayAppts.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  if (isLoading) return <><Topbar title="بوابة الطبيب" /><LoadingSpinner /></>;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="بوابة الطبيب" />
      <div className="p-6 space-y-5">

        {/* Welcome hero */}
        <div className="bg-gradient-to-bl from-teal-700 via-teal-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-teal-200 text-sm">{formatDate(now, 'EEEE، dd MMMM yyyy')}</p>
            <h1 className="text-2xl font-black mt-1">{greeting}، {profile?.name ?? 'دكتور'} 👋</h1>
            <p className="text-teal-100 text-sm mt-1">
              {profile?.specialty && <span className="font-medium">{profile.specialty} · </span>}
              لديك <span className="font-black text-white text-lg">{todayAppts.length}</span> موعد اليوم
            </p>
            {nextAppt && (
              <div className="mt-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <Clock className="w-4 h-4 text-teal-200 flex-shrink-0" />
                <div>
                  <p className="text-xs text-teal-200">الموعد القادم</p>
                  <p className="text-sm font-bold">{nextAppt.patient?.name ?? 'مريض'} · {nextAppt.time}</p>
                </div>
                <Link href={`/portal/appointments/${nextAppt.id}`} className="mr-auto">
                  <ChevronLeft className="w-4 h-4 text-white/60" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'مواعيد اليوم', value: todayAppts.length, icon: CalendarDays, color: 'bg-blue-50 text-blue-600' },
            { label: 'مكتملة', value: completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'قادمة', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* AI assistant shortcut */}
        <Link href="/portal/ai-assistant">
          <div className="bg-gradient-to-l from-blue-600 to-teal-600 rounded-2xl p-4 flex items-center gap-4 hover:opacity-95 transition-opacity cursor-pointer">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">المساعد الذكي</p>
              <p className="text-xs text-blue-200">ملخص المرضى · مسودة ذكية · تحليل التحاليل</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-white/50 flex-shrink-0" />
          </div>
        </Link>

        {/* Today's schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">جدول اليوم</h2>
            <Link href="/portal/appointments" className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-0.5">
              الكل <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 flex flex-col items-center text-gray-400">
              <CalendarDays className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">لا توجد مواعيد اليوم</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((appt, i) => {
                const isNext = i === 0 && (appt.status === 'CONFIRMED' || appt.status === 'PENDING');
                return (
                  <Link key={appt.id} href={`/portal/appointments/${appt.id}`}>
                    <div className={`bg-white rounded-2xl border transition-all hover:shadow-md cursor-pointer flex items-center gap-4 p-4 mb-2 ${isNext ? 'border-teal-300 ring-1 ring-teal-200' : 'border-gray-100'}`}>
                      {/* Number */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${isNext ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {i + 1}
                      </div>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {appt.patient?.name?.[0] ?? 'م'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{appt.patient?.name ?? 'مريض'}</p>
                        <p className="text-xs text-gray-400">{appt.type ?? 'زيارة عادية'}</p>
                      </div>
                      {/* Time + status */}
                      <div className="text-left flex-shrink-0 space-y-1">
                        <p className="text-sm font-mono font-bold text-gray-700" dir="ltr">{appt.time}</p>
                        <AppointmentStatusBadge status={appt.status} />
                      </div>
                      <ChevronLeft className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
