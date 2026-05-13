'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Topbar from '@/components/layout/Topbar';
import { appointmentsService } from '@/services/appointments.service';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { 
  CalendarDays, ChevronLeft, Clock, Search, 
  Filter, Sparkles, User, Activity, 
  CalendarClock, CheckCircle2, Zap, ArrowRight,
  Stethoscope, MapPin
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    appointmentsService.getMyAppointments({ limit: 100 })
      .then(res => setAppointments(res.data || []))
      .catch(() => toast.error('فشل تحميل قائمة المواعيد'))
      .finally(() => setIsLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="مواعيدي" />
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-40 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-[2rem] bg-white/50 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة المواعيد الطبية" subtitle="سجل زياراتك ومواعيدك القادمة" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Header Hero */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col md:flex-row gap-8 md:items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <CalendarClock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">جدول المواعيد</h1>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  الإجمالي: {appointments.length}
                </span>
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  قادم: {upcoming.length}
                </span>
              </div>
            </div>
          </div>
          
          <Link href="/patient/search" className="relative z-10 flex items-center gap-3 bg-blue-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
            <Search className="w-4 h-4" />
            حجز موعد جديد
          </Link>
        </div>

        {/* Sections */}
        {appointments.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800">لا توجد مواعيد مسجلة</h3>
            <p className="text-sm font-medium text-slate-400 mt-2 mb-8 max-w-sm">ابدأ رحلتك الصحية بحجز موعدك الأول مع أحد أطبائنا المتميزين.</p>
            <Link href="/patient/search" className="text-blue-600 font-black text-sm border-2 border-blue-600 px-8 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
              تصفح الأطباء
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Section */}
            {upcoming.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] whitespace-nowrap bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    المواعيد القادمة
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-100 to-transparent" />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {upcoming.map((appt) => (
                    <AppointmentItem key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Section */}
            {past.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    الزيارات السابقة
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {past.map((appt) => (
                    <AppointmentItem key={appt.id} appt={appt} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-300 uppercase tracking-widest pt-8 border-t border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>إدارة مواعيد 2YHospital - جودة رعاية عالمية</span>
        </div>

      </div>
    </div>
  );
}

function AppointmentItem({ appt, isPast = false }: { appt: Appointment; isPast?: boolean }) {
  return (
    <Link href={`/patient/appointments/${appt.id}`}>
      <div className={`group relative bg-white rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden ${isPast ? 'border-slate-100 bg-white/60' : 'border-white shadow-sm'}`}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          
          {/* Time & Date Column */}
          <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center md:w-32 gap-1 border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-8">
            <p className={`text-xl font-black tabular-nums ${isPast ? 'text-slate-400' : 'text-blue-600'}`} dir="ltr">{appt.time}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(appt.date, 'dd MMM yyyy')}</p>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
              {appt.doctor?.name?.[0] ?? 'د'}
            </div>
            <div>
              <p className={`text-lg font-black transition-colors ${isPast ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}`}>
                د. {appt.doctor?.name ?? 'طبيب المركز'}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> {appt.doctor?.specialty ?? 'كشف عام'}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> العيادة الرئيسية
                </span>
              </div>
            </div>
          </div>

          {/* Status & Action */}
          <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0">
            <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPast ? 'bg-slate-50 text-slate-300' : 'bg-blue-50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
              <ChevronLeft className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        {!isPast && (
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        )}
      </div>
    </Link>
  );
}
