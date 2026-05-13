'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { ConfirmDialog } from '@/components/shared';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate, cn } from '@/lib/utils';
import { 
  ArrowRight, Calendar, Clock, Stethoscope, 
  MapPin, ShieldCheck, Sparkles, Zap, 
  ChevronRight, Phone, MessageSquare, AlertCircle,
  FileText, Map, QrCode, Share2, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Appointment, AppointmentStatus } from '@/types';

export default function PatientAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    appointmentsService.getMyAppointment(id)
      .then(setAppointment)
      .catch(() => toast.error('لم يتم العثور على الموعد'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    try {
      await appointmentsService.cancel(id, 'إلغاء من تطبيق المريض');
      toast.success('تم إلغاء الموعد بنجاح');
      router.push('/patient/appointments');
    } catch {
      toast.error('فشل إلغاء الموعد');
    }
    setShowCancel(false);
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-8 max-w-2xl mx-auto space-y-6">
        <div className="h-20 rounded-2xl bg-white/50 animate-pulse" />
        <div className="h-96 rounded-[3rem] bg-white/50 animate-pulse border border-slate-100" />
      </div>
    </div>
  );

  if (!appointment) return (
    <div className="bg-[#f4f7f8] min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-black text-slate-800">لم يتم العثور على الموعد</h3>
      <button onClick={() => router.push('/patient/appointments')} className="mt-6 text-blue-600 font-black text-sm">العودة للقائمة</button>
    </div>
  );

  const isUpcoming = appointment.status === 'CONFIRMED' || appointment.status === 'PENDING';

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="بطاقة الزيارة الطبية" subtitle={`مرجع رقم: #${id.slice(-6).toUpperCase()}`} />
      
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto space-y-8">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-3 text-xs font-black text-slate-400 hover:text-[#115e6e] transition-all bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          العودة للمواعيد
        </button>

        {/* Main Appointment Ticket Card */}
        <div className="relative group">
          {/* Paper Texture Decoration */}
          <div className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50" />
          </div>

          <div className="relative p-8 md:p-12 flex flex-col items-center space-y-10">
            
            {/* Status Header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">حالة الموعد</p>
                  <AppointmentStatusBadge status={appointment.status as AppointmentStatus} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-300 transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-300 transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Doctor Circle */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-slate-50 p-1 ring-4 ring-slate-50/50 shadow-inner">
                <div className="w-full h-full rounded-[2.2rem] bg-white flex items-center justify-center text-blue-600 font-black text-4xl shadow-sm">
                  {appointment.doctor?.name?.[0] ?? 'د'}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">د. {appointment.doctor?.name}</h2>
                <p className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1 rounded-full border border-blue-100 inline-block">{appointment.doctor?.specialty || 'ممارس عام'}</p>
              </div>
            </div>

            {/* Middle Divider (Perforated line effect) */}
            <div className="w-full relative flex items-center justify-center">
              <div className="absolute left-[-32px] md:left-[-48px] w-8 h-8 rounded-full bg-[#f4f7f8] shadow-inner" />
              <div className="absolute right-[-32px] md:right-[-48px] w-8 h-8 rounded-full bg-[#f4f7f8] shadow-inner" />
              <div className="w-full border-t-2 border-dashed border-slate-100" />
            </div>

            {/* Time & Location Details */}
            <div className="w-full grid grid-cols-2 gap-8">
              <div className="space-y-1 text-center border-l border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <Calendar className="w-3 h-3 text-blue-500" /> التاريخ
                </p>
                <p className="text-lg font-black text-slate-700 tracking-tight">{formatDate(appointment.date, 'EEEE')}</p>
                <p className="text-xs font-bold text-slate-400">{formatDate(appointment.date, 'dd MMMM yyyy')}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3 text-indigo-500" /> الوقت
                </p>
                <p className="text-lg font-black text-slate-700 tracking-tight" dir="ltr">{appointment.time}</p>
                <p className="text-xs font-bold text-slate-400">حضور قبل 15 دقيقة</p>
              </div>
            </div>

            <div className="w-full flex items-center gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">موقع العيادة</p>
                <p className="text-xs font-black text-slate-700">المبنى الرئيسي - الدور الثاني - عيادة 204</p>
              </div>
              <Map className="w-5 h-5 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer" />
            </div>

            {/* QR Code Placeholder (Aesthetic) */}
            <div className="pt-4 flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center opacity-50">
                <QrCode className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Scan at hospital reception</p>
            </div>

          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-6">
          {isUpcoming && (
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600" /> تعليمات هامة
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-black text-[10px]">1</div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">يرجى الصيام لمدة 8 ساعات قبل الموعد إذا كان يتضمن تحاليل دم مخبرية.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-black text-[10px]">2</div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">أحضر معك كافة الأدوية الحالية أو الفحوصات الخارجية السابقة لمراجعتها.</p>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <button 
                  onClick={() => setShowCancel(true)}
                  className="flex-1 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-3"
                >
                  <X className="w-4 h-4" /> إلغاء الموعد
                </button>
                <button className="flex-1 py-4 rounded-2xl bg-[#115e6e] text-white font-black text-xs hover:bg-[#0d4d5a] transition-all shadow-lg shadow-[#115e6e]/10 flex items-center justify-center gap-3">
                  <MessageSquare className="w-4 h-4" /> تواصل مع الطبيب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest pt-8">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>نظام 2Y-Secure لحماية خصوصية المريض</span>
        </div>

      </div>

      <ConfirmDialog
        isOpen={showCancel}
        title="تأكيد إلغاء الموعد"
        message="هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟ قد لا تتوفر فترات قريبة في حال الإلغاء."
        confirmLabel="نعم، قم بالإلغاء"
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
        danger
      />
    </div>
  );
}

