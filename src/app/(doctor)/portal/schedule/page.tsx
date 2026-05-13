'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doctorsService } from '@/services/doctors.service';
import { LoadingSpinner, PageHeader } from '@/components/shared';
import ScheduleSlotManager, { type DaySlot } from '@/components/doctors/ScheduleSlotManager';
import Topbar from '@/components/layout/Topbar';
import { 
  Save, ArrowRight, CalendarClock, Sparkles, 
  ShieldCheck, Zap, Info, Clock, 
  ChevronLeft, AlertCircle
} from 'lucide-react';
import { DAY_NAMES_AR } from '@/lib/utils';
import toast from 'react-hot-toast';

const defaultSchedule: DaySlot[] = DAY_NAMES_AR.map(() => ({
  enabled: false, startTime: '09:00', endTime: '17:00', slotDuration: 30,
}));

export default function DoctorSchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<DaySlot[]>(defaultSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    doctorsService.getMyProfile().then((profile) => {
      if (profile.schedule?.length) {
        const merged = [...defaultSchedule];
        profile.schedule.forEach((slot) => {
          if (slot.dayOfWeek >= 0 && slot.dayOfWeek < 7) {
            merged[slot.dayOfWeek] = { 
              enabled: !slot.isBlocked, 
              startTime: slot.startTime, 
              endTime: slot.endTime, 
              slotDuration: slot.slotDurationMinutes 
            };
          }
        });
        setSchedule(merged);
      }
    }).catch(() => toast.error('فشل تحميل جدول العمل'))
    .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = (idx: number) => setSchedule((p) => p.map((d, i) => i === idx ? { ...d, enabled: !d.enabled } : d));
  const handleChange = (idx: number, field: keyof DaySlot, value: string | number | boolean) =>
    setSchedule((p) => p.map((d, i) => i === idx ? { ...d, [field]: value } : d));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await doctorsService.setSchedule(schedule.map((d, idx) => ({
        dayOfWeek: idx, startTime: d.startTime, endTime: d.endTime,
        slotDurationMinutes: d.slotDuration, isBlocked: !d.enabled,
      })));
      toast.success('تم حفظ الجدول بنجاح');
    } catch { toast.error('فشل حفظ الجدول'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="إدارة الجدول" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse" />
        <div className="h-96 rounded-[2.5rem] bg-white/50 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="تخطيط وقت العمل" subtitle="تخصيص أيام وساعات التواجد في العيادة" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all w-fit"
          >
            <ArrowRight className="w-4 h-4" /> العودة للبوابة
          </button>
          
          <div className="flex items-center gap-3 bg-[#115e6e]/5 px-4 py-2 rounded-2xl border border-[#115e6e]/10">
            <ShieldCheck className="w-4 h-4 text-[#115e6e]" />
            <span className="text-[10px] font-black text-[#115e6e] uppercase tracking-widest">تحديثات فورية للمرضى</span>
          </div>
        </div>

        {/* Hero Schedule Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
                <CalendarClock className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة أوقات العمل</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">حدد أيام وساعات عملك التي ستظهر للمرضى عند الحجز.</p>
              </div>
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="flex items-center justify-center gap-3 bg-[#115e6e] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-[#115e6e]/20 hover:bg-[#0d4753] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ الجدول'}
            </button>
          </div>

          <div className="p-8">
            {/* Note about Slot Duration */}
            <div className="mb-8 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 mb-1">ملاحظة حول مدة الجلسة</p>
                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                  تأكد من اختيار مدة جلسة كافية لكل تخصص. سيقوم النظام بتقسيم ساعات العمل المحددة بناءً على هذه المدة.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <ScheduleSlotManager schedule={schedule} onChange={handleChange} onToggle={handleToggle} />
            </div>
          </div>
        </div>

        {/* Informational Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">تحديثات ذكية</p>
              <p className="text-[10px] font-bold text-slate-400">سيتم تحديث المواعيد المتاحة فوراً للمرضى.</p>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">بيانات مؤمنة</p>
              <p className="text-[10px] font-bold text-slate-400">كافة بيانات جدولك محمية ولا تظهر إلا للمصرح لهم.</p>
            </div>
          </div>
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - إدارة الكفاءات الطبية</span>
        </div>

      </div>
    </div>
  );
}
