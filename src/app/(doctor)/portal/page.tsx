'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { doctorsService } from '@/services/doctors.service';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { 
  Bot, CalendarDays, CheckCircle2, ChevronLeft, 
  Clock, Stethoscope, Sparkles, User, 
  Activity, ArrowUpRight, Zap, Bell
} from 'lucide-react';
import type { Appointment, Doctor } from '@/types';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/10`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function DoctorPortalPage() {
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور';

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    Promise.all([
      appointmentsService.getTodaySchedule(),
      doctorsService.getMyProfile(),
    ])
      .then(([appts, doc]) => {
        setTodayAppts(appts);
        setProfile(doc);
      })
      .catch(() => toast.error('فشل تحميل بيانات البوابة'))
      .finally(() => setIsLoading(false));
  }, []);

  const completed = todayAppts.filter((a) => a.status === 'COMPLETED').length;
  const pending = todayAppts.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
  const nextAppt = todayAppts.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="بوابة الطبيب" />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-64 rounded-[2.5rem] bg-white/50 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-[2rem] bg-white/50 animate-pulse" />)}
        </div>
        <div className="h-96 rounded-[2.5rem] bg-white/50 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="لوحة تحكم الطبيب" subtitle="مرحباً بك في نظام الإدارة الذكي" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Hero Identity Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-[#115e6e]/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_400px] lg:items-center gap-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold">
                <Sparkles className="w-4 h-4 text-teal-300" />
                {formatDate(now, 'EEEE، dd MMMM yyyy')}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {greeting}، <br />
                {profile?.name ?? 'دكتور'}
              </h1>
              <p className="text-white/60 font-medium text-sm md:text-lg max-w-xl">
                {profile?.specialty && <span className="text-teal-300 font-bold">{profile.specialty} · </span>}
                لديك <span className="text-white font-black">{todayAppts.length}</span> مواعيد مجدولة لهذا اليوم.
              </p>
            </div>

            {/* Next Appointment Quick Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-teal-300 uppercase tracking-widest">الموعد القادم</p>
                <Link href="/portal/appointments" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              
              {nextAppt ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#115e6e] flex items-center justify-center font-black text-xl shadow-lg">
                    {nextAppt.patient?.name?.[0] ?? 'م'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg truncate">{nextAppt.patient?.name ?? 'مريض'}</p>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {nextAppt.time}
                    </div>
                  </div>
                  <Link href={`/portal/appointments/${nextAppt.id}`} className="px-4 py-2 bg-[#2bbcb3] rounded-xl text-xs font-black hover:scale-105 transition-all">
                    فتح الملف
                  </Link>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm font-bold text-white/50 italic">لا توجد مواعيد متبقية حالياً</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="إجمالي مواعيد اليوم" value={todayAppts.length} icon={CalendarDays} color="bg-blue-50 text-blue-600" />
          <StatCard label="حالات تم إنجازها" value={completed} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="مراجعات متبقية" value={pending} icon={Activity} color="bg-amber-50 text-amber-600" />
        </div>

        {/* Smart AI Access Card */}
        <Link href="/portal/ai-assistant">
          <div className="group relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl shadow-slate-900/10 transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-125" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2bbcb3] to-[#115e6e] flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Bot className="w-9 h-9" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-black mb-1 flex items-center justify-center md:justify-start gap-2">
                  المساعد السريري الذكي (AI)
                  <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-lg border border-teal-500/20">BETA</span>
                </h3>
                <p className="text-slate-400 text-sm font-medium">تحليل تاريخ المرضى، صياغة الملاحظات الطبية، وتنظيم اليوم بلمسة ذكية واحدة.</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#2bbcb3] transition-all">
                <ChevronLeft className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        {/* Today's Timeline */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">الجدول السريري لليوم</h3>
                <p className="text-[11px] font-bold text-slate-400">مواعيد المرضى مرتبة حسب وقت الحجز</p>
              </div>
            </div>
            <Link href="/portal/appointments" className="text-xs font-black text-[#115e6e] bg-[#115e6e]/5 px-4 py-2 rounded-xl hover:bg-[#115e6e] hover:text-white transition-all">
              عرض السجل الكامل
            </Link>
          </div>

          <div className="p-6 md:p-8">
            {todayAppts.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-lg font-black text-slate-700">لا توجد مواعيد اليوم</h4>
                <p className="text-sm font-medium text-slate-400">استمتع بيوم هادئ أو قم بمراجعة الأبحاث الطبية.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppts.map((appt, idx) => {
                  const isNext = appt.id === nextAppt?.id;
                  return (
                    <Link key={appt.id} href={`/portal/appointments/${appt.id}`}>
                      <div className={`group flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-[2rem] border transition-all hover:shadow-lg ${isNext ? 'bg-[#115e6e]/5 border-[#115e6e]/20 ring-1 ring-[#115e6e]/10' : 'bg-white/40 border-slate-50 hover:bg-white'}`}>
                        {/* Time Column */}
                        <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center md:w-24 gap-1 border-b md:border-b-0 md:border-l border-slate-100 pb-3 md:pb-0 md:pl-6">
                          <p className={`text-base font-black tabular-nums ${isNext ? 'text-[#115e6e]' : 'text-slate-800'}`} dir="ltr">{appt.time}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idx + 1} OF {todayAppts.length}</p>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-110 transition-transform">
                            {appt.patient?.name?.[0] ?? 'م'}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-base mb-0.5 group-hover:text-[#115e6e] transition-colors">
                              {appt.patient?.name ?? 'مريض'}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> {appt.type ?? 'كشف جديد'}
                              </span>
                              {isNext && (
                                <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 animate-pulse">
                                  قيد الانتظار حالياً
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Action */}
                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <AppointmentStatusBadge status={appt.status} />
                          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-[#115e6e] group-hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Support */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">مركز الدعم الطبي</p>
              <p className="text-xs font-medium text-slate-500">لأي استفسارات تقنية، فريق الدعم متاح 24/7.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            تواصل مع الإدارة
          </button>
        </div>

      </div>
    </div>
  );
}
