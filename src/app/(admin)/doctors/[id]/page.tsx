'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import { LoadingSpinner, Badge } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Phone, Calendar, Star, CheckCircle2, XCircle, 
  Clock, Mail, MapPin, Building2, UserCircle, History,
  TrendingUp, Activity, DollarSign, Sparkles, ChevronLeft,
  Stethoscope
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Doctor, Appointment } from '@/types';

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    Promise.all([
      doctorsService.getProfile(id),
      appointmentsService.getAllAppointments({ doctorId: id, limit: 10 }),
    ])
      .then(([doc, appts]) => { 
        setDoctor(doc); 
        setAppointments(appts.data || []); 
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملف الطبيب" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-64 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="bg-[#f4f7f8] min-h-screen flex flex-col">
      <Topbar title="خطأ في التحميل" />
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <p className="text-slate-400 font-bold mb-4">لم يتم العثور على بيانات هذا الطبيب.</p>
        <button onClick={() => router.back()} className="text-sm font-black text-[#115e6e] underline">العودة للخلف</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة ملف الطبيب" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لقائمة الأطباء
          </button>
          
          <Link 
            prefetch={false}
            href={`/doctors/${id}/schedule`} 
            className="flex items-center gap-2 text-sm font-black bg-[#115e6e] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#115e6e]/20 active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4" /> إدارة جدول المواعيد
          </Link>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="relative h-40 md:h-48 bg-gradient-to-br from-[#115e6e] to-[#2bbcb3]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          </div>
          
          <div className="px-8 md:px-10 pb-10">
            <div className="flex flex-col md:flex-row items-end justify-between -mt-16 mb-8 gap-6">
              <div className="relative flex items-end gap-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white border-[6px] border-[#f4f7f8] shadow-2xl flex items-center justify-center text-[#115e6e] font-black text-5xl">
                  {doctor.name.replace('د. ', '').replace('دكتور ', '')[0]}
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{doctor.name}</h1>
                  <div className="flex items-center gap-2 mt-1.5 text-sm font-bold text-[#2bbcb3]">
                    <Stethoscope className="w-4 h-4" />
                    {doctor.specialty}
                  </div>
                </div>
              </div>
              
              <div className="mb-4 flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-sm border",
                  doctor.isActive 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  <div className={cn("w-2 h-2 rounded-full", doctor.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                  {doctor.isActive ? 'الحالة: نشط' : 'الحالة: غير نشط'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-slate-400" />
                    السيرة المهنية
                  </h3>
                  <p className="text-base font-bold text-slate-500 leading-relaxed">
                    {doctor.bio || 'لا يوجد سيرة ذاتية مسجلة حالياً.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Phone className="w-5 h-5" /></div>
                     <div><p className="text-[10px] font-black text-slate-400">رقم التواصل</p><p className="text-sm font-bold text-slate-700" dir="ltr">{doctor.phone || '—'}</p></div>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><MapPin className="w-5 h-5" /></div>
                     <div><p className="text-[10px] font-black text-slate-400">الفرع والعيادة</p><p className="text-sm font-bold text-slate-700">{doctor.branch || 'الفرع الرئيسي'}</p></div>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#115e6e] rounded-[2rem] p-6 text-white shadow-xl shadow-[#115e6e]/20">
                  <h4 className="text-xs font-black uppercase tracking-widest text-teal-300 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> إحصائيات الأداء
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/60">إجمالي المراجعات</span>
                      <span className="text-xl font-black">{doctor.stats?.totalAppointments ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/60">حالات مكتملة</span>
                      <span className="text-xl font-black text-teal-300">{doctor.stats?.completedAppointments ?? 0}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm font-bold text-white/60">رسوم الكشف</span>
                      <span className="text-xl font-black">{doctor.consultationFee ? `${doctor.consultationFee} ر.س` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Appointments List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 bg-white/40 flex items-center justify-between">
            <h3 className="text-base font-black text-[#115e6e] flex items-center gap-2">
              <History className="w-5 h-5" />
              سجل المواعيد الأخير
            </h3>
            <Link prefetch={false} href={`/appointments?doctorId=${id}`} className="text-xs font-black text-[#2bbcb3] hover:underline flex items-center gap-1">
              عرض السجل الكامل <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {appointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-sm italic">لا توجد مواعيد مسجلة قريبة لهذا الطبيب.</div>
            ) : (
              appointments.slice(0, 5).map((appt) => (
                <Link key={appt.id} href={`/appointments/${appt.id}`} prefetch={false}>
                  <div className="group flex items-center justify-between px-8 py-4 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#115e6e] font-black text-xs flex items-center justify-center group-hover:bg-[#115e6e] group-hover:text-white transition-colors">
                        {appt.patient?.name?.[0] ?? 'م'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{appt.patient?.name ?? 'مريض غير معروف'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(appt.date)} · {appt.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <AppointmentStatusBadge status={appt.status} />
                      <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-[#115e6e] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
