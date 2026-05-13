'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate } from '@/lib/utils';
import { LoadingSpinner, ConfirmDialog } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import RescheduleModal from '@/components/appointments/RescheduleModal';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Calendar, Clock, User, Stethoscope, 
  Building2, FileText, RefreshCw, X, ChevronRight,
  ShieldAlert, MoreHorizontal, MapPin, Phone, History,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

function InfoBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white shadow-sm transition-all hover:bg-white/60">
      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-[#115e6e] group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    appointmentsService.getMyAppointment(id)
      .then(setAppt)
      .catch(() => toast.error('لم يتم العثور على الموعد'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await appointmentsService.cancel(id, 'إلغاء من الإدارة');
      toast.success('تم إلغاء الموعد');
      setAppt((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
    } catch { toast.error('فشل إلغاء الموعد'); }
    finally { setIsCancelling(false); setShowCancel(false); }
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
      </div>
    </div>
  );

  if (!appt) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-bold">لم يتم العثور على الموعد المطلوب.</p>
        <button onClick={() => router.back()} className="mt-6 text-sm font-black text-[#115e6e] hover:underline">العودة للخلف</button>
      </div>
    </div>
  );

  const isActive = appt.status === 'CONFIRMED' || appt.status === 'PENDING';

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة الموعد" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لسجل المواعيد
          </button>
          
          <div className="flex items-center gap-3">
             <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#115e6e] transition-colors">
               <MoreHorizontal className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm transition-all hover:shadow-md">
          
          {/* Header Section */}
          <div className="relative p-8 md:p-10 border-b border-slate-50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#115e6e]/20">
                  {appt.patient?.name?.[0] ?? 'م'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{appt.patient?.name ?? 'مريض'}</h2>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {appt.patient?.phone}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {appt.branch || 'الفرع الرئيسي'}</div>
                  </div>
                </div>
              </div>

              {isActive && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="flex items-center gap-2 bg-[#115e6e] hover:bg-[#0d4753] text-white text-sm font-black px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#115e6e]/20 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" /> إعادة جدولة الموعد
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8 md:p-10 bg-white/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <InfoBlock icon={Stethoscope} label="الطبيب المعالج" value={appt.doctor.name} />
              <InfoBlock icon={History} label="التخصص الطبي" value={appt.doctor.specialty} />
              <InfoBlock icon={Calendar} label="تاريخ الموعد" value={formatDate(appt.date)} />
              <InfoBlock icon={Clock} label="الوقت المحدد" value={appt.time} />
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50/50 rounded-[1.8rem] border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  تفاصيل إضافية عن الزيارة
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-black text-[#2bbcb3] mb-1">سبب الزيارة</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{appt.reason || 'مراجعة عامة'}</p>
                  </div>
                  {appt.notes && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-black text-[#2bbcb3] mb-1">ملاحظات الإدارة</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{appt.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="flex items-center justify-between p-6 bg-red-50/30 rounded-[1.8rem] border border-red-50">
                  <div>
                    <p className="text-sm font-black text-red-800">هل تود إلغاء هذا الموعد؟</p>
                    <p className="text-xs font-bold text-red-500 mt-0.5">سيتم إرسال تنبيه فوري لكل من المريض والطبيب.</p>
                  </div>
                  <button
                    onClick={() => setShowCancel(true)}
                    className="flex items-center gap-2 bg-white text-red-600 border border-red-100 hover:bg-red-50 text-xs font-black px-5 py-3 rounded-xl transition-all shadow-sm"
                  >
                    <X className="w-4 h-4" /> إلغاء الموعد نهائياً
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit / Sparkle Footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>تمت جدولة هذا الموعد وتأكيده عبر النظام الذكي</span>
        </div>

        <ConfirmDialog
          isOpen={showCancel}
          title="تأكيد الإلغاء"
          message="أنت على وشك إلغاء موعد المريض. هذه العملية ستؤثر على جدول الطبيب ولن يمكن التراجع عنها."
          confirmLabel="تأكيد الإلغاء الآن"
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          danger
        />
        <RescheduleModal
          appointmentId={id}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => {
            setAppt((prev) => prev ? { ...prev, status: 'CONFIRMED' } : prev);
            toast.success('تم تحديث موعد المريض بنجاح');
          }}
        />
      </div>
    </div>
  );
}
