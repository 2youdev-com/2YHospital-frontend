'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doctorsService } from '@/services/doctors.service';
import { LoadingSpinner, PageHeader } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Clock, CalendarDays, ShieldCheck, 
  Sparkles, Stethoscope, ChevronLeft, MapPin,
  Activity, Zap
} from 'lucide-react';
import { DAY_NAMES_AR } from '@/lib/utils';
import type { Doctor } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDoctorSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    doctorsService.getProfile(id)
      .then(setDoctor)
      .catch(() => toast.error('فشل تحميل بيانات الطبيب'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="جدول الطبيب" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-40 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/50 animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="جدول الطبيب" />
      <div className="p-12 text-center text-slate-500 font-bold">لم يتم العثور على الطبيب</div>
    </div>
  );

  const schedule = doctor.schedule ?? [];

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة مواعيد العمل" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لملف الطبيب
          </button>
        </div>

        {/* Doctor Identity Hero */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#115e6e]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#115e6e]/20">
              {doctor.name.replace('د. ', '')[0]}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{doctor.name}</h1>
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> نشط حالياً
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                <div className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> {doctor.specialty}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {doctor.branch || 'الفرع الرئيسي'}</div>
                <div className="flex items-center gap-1.5 text-[#2bbcb3]"><Zap className="w-3.5 h-3.5" /> {schedule.length} أيام عمل أسبوعياً</div>
              </div>
            </div>

            <div className="bg-[#115e6e]/5 p-4 rounded-2xl border border-[#115e6e]/10 text-right">
              <p className="text-[10px] font-black text-[#115e6e] uppercase tracking-wider mb-1">تعليمات الإدارة</p>
              <p className="text-xs font-bold text-slate-600 max-w-[200px] leading-relaxed">
                يُعدل الجدول من قبل الطبيب أو المدير العام حصراً.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-2 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-[#115e6e]" />
            <h3 className="text-lg font-black text-slate-800">الأوقات المعتمدة للعيادة</h3>
          </div>

          <div className="p-4 space-y-2">
            {DAY_NAMES_AR.map((dayName, idx) => {
              const daySlots = schedule.filter(s => s.dayOfWeek === idx);
              const hasWork = daySlots.length > 0;
              
              return (
                <div 
                  key={idx} 
                  className={`group relative flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 ${hasWork ? 'bg-white hover:shadow-lg hover:-translate-y-0.5 border border-slate-50' : 'bg-slate-50/50 opacity-60'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${hasWork ? 'bg-[#115e6e]/5 text-[#115e6e]' : 'bg-slate-100 text-slate-400'}`}>
                      <Activity className={`w-5 h-5 ${hasWork ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <p className={`text-base font-black ${hasWork ? 'text-slate-800' : 'text-slate-400'}`}>{dayName}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {hasWork ? `${daySlots.length} فترات زمنية` : 'يوم راحة / عطلة'}
                      </p>
                    </div>
                  </div>

                  {hasWork ? (
                    <div className="flex flex-wrap gap-2 justify-end max-w-[50%]">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm ${slot.isBlocked ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-[#115e6e] text-white'}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span dir="ltr">{slot.startTime} - {slot.endTime}</span>
                          <span className="text-[9px] opacity-60">({slot.slotDurationMinutes}د)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-2.5 rounded-xl border border-dashed border-slate-200 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      CLOSED
                    </div>
                  )}
                  
                  {hasWork && (
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#2bbcb3] rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-amber-50/30 rounded-2xl border border-amber-50 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-amber-800">تذكير الإدارة الذكية</p>
            <p className="text-xs font-bold text-amber-700 leading-relaxed opacity-80">
              تغيير جدول العمل يؤثر فوراً على توفر المواعيد للمرضى في النظام. تأكد من إخطار الطبيب قبل إجراء أي تعديلات جوهرية.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
