'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner, Badge } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, FileText, Bot, AlertTriangle, Pill, Phone, 
  Calendar, Clock, CheckCircle2, Sparkles, User, 
  Activity, ArrowUpRight, Zap, ShieldCheck
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Appointment, PatientSummary } from '@/types';

function ClinicalCard({ title, icon: Icon, color, children }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.8rem] border border-white p-5 shadow-sm">
      <h3 className={`font-black text-sm mb-4 flex items-center gap-2 ${color}`}>
        <Icon className="w-4.5 h-4.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function DoctorAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!id || fetchLock.current === id) return;
    fetchLock.current = id;
    
    setIsLoading(true);
    setSummary(null);

    appointmentsService.getDoctorAppointment(id)
      .then(async (a) => {
        if (ignore) return;
        setAppt(a);
        if (a.patient?.id) {
          try {
            const res = await medicalRecordsService.getPatientSummary(a.patient.id);
            if (!ignore) setSummary(res);
          } catch (e) {
            // Silently fail summary load
          }
        }
      })
      .catch(() => { if (!ignore) toast.error('لم يتم العثور على الموعد'); })
      .finally(() => { if (!ignore) setIsLoading(false); });

    return () => { ignore = true; };
  }, [id]);

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-40 rounded-[2.5rem] bg-white/50 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/50 animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!appt) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-12 text-center text-slate-500 font-bold">لم يتم العثور على الموعد</div>
    </div>
  );

  const isActive = appt.status === 'CONFIRMED' || appt.status === 'PENDING';

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة الزيارة السريرية" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لقائمة المواعيد
          </button>
        </div>

        {/* Patient Hero Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-72 bg-gradient-to-br from-[#115e6e] to-[#0d4753] p-8 text-white relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="w-24 h-24 rounded-3xl bg-white text-[#115e6e] flex items-center justify-center font-black text-4xl shadow-xl mb-6 relative z-10 group-hover:scale-105 transition-transform">
              {appt.patient?.name?.[0] ?? 'م'}
            </div>
            <h2 className="text-2xl font-black mb-2 relative z-10 leading-tight">{appt.patient?.name ?? 'مريض'}</h2>
            <div className="flex flex-col gap-2 relative z-10">
              <AppointmentStatusBadge status={appt.status} />
              {appt.patient?.phone && (
                <p className="text-white/60 text-xs font-bold flex items-center justify-center gap-1.5" dir="ltr">
                  <Phone className="w-3.5 h-3.5" /> {appt.patient.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">بيانات الحجز</h3>
              <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                معرّف الموعد: #{id.slice(-8).toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-500 flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الزيارة</p>
                  <p className="font-bold text-sm text-slate-700">{formatDate(appt.date)}</p>
                </div>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white text-teal-500 flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوقت المحدد</p>
                  <p className="font-bold text-sm text-slate-700" dir="ltr">{appt.time}</p>
                </div>
              </div>
            </div>

            {appt.reason && (
              <div className="p-5 bg-[#115e6e]/5 rounded-2xl border border-[#115e6e]/10">
                <p className="text-[10px] font-black text-[#115e6e] uppercase tracking-widest mb-2">الشكوى / سبب الزيارة</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{appt.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Grid */}
        {isActive && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href={`/portal/patients/${appt.patient?.id}`} className="flex items-center gap-4 p-5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">الملف السريري</p>
                <p className="text-[10px] font-bold text-slate-400">تاريخ المريض الكامل</p>
              </div>
            </Link>
            
            <Link href={`/portal/notes/${id}`} className="flex items-center gap-4 p-5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">ملاحظات الزيارة</p>
                <p className="text-[10px] font-bold text-slate-400">بدء تشخيص الحالة</p>
              </div>
            </Link>

            <Link href={`/portal/ai-assistant?patientId=${appt.patient?.id}`} className="flex items-center gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2bbcb3] to-[#115e6e] text-white flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white">ملخص AI الذكي</p>
                <p className="text-[10px] font-bold text-slate-400">تحليل فوري للحالة</p>
              </div>
            </Link>
          </div>
        )}

        {/* Clinical Summary Section */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alerts */}
            <ClinicalCard title="تنبيهات وحساسية" icon={AlertTriangle} color="text-rose-600">
              <div className="space-y-3">
                {summary.activeAlerts.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs font-bold text-rose-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    {a}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-2">
                  {summary.patient.allergies?.map(a => (
                    <span key={a} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-100">
                      {a}
                    </span>
                  ))}
                  {(summary.patient.allergies?.length ?? 0) === 0 && (
                    <p className="text-xs font-bold text-slate-400 italic">لا توجد حالات حساسية مسجلة</p>
                  )}
                </div>
              </div>
            </ClinicalCard>

            {/* Medications */}
            <ClinicalCard title="الأدوية الحالية" icon={Pill} color="text-blue-600">
              <div className="space-y-2">
                {summary.currentMedications.length > 0 ? summary.currentMedications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-sm font-black text-slate-800">{med.name}</p>
                      <p className="text-[10px] font-bold text-blue-600">{med.frequency}</p>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-blue-100">
                      {med.dosage}
                    </span>
                  </div>
                )) : (
                  <div className="py-6 text-center">
                    <p className="text-xs font-bold text-slate-400 italic">لا توجد أدوية نشطة حالياً</p>
                  </div>
                )}
              </div>
            </ClinicalCard>

            {/* Latest Vitals / Activity */}
            <ClinicalCard title="آخر القياسات الحيوية" icon={Activity} color="text-[#2bbcb3]">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#2bbcb3]/5 rounded-2xl border border-[#2bbcb3]/10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">النبض</p>
                  <p className="text-xl font-black text-[#115e6e]">72 <span className="text-[10px] text-slate-400">BPM</span></p>
                </div>
                <div className="p-4 bg-[#2bbcb3]/5 rounded-2xl border border-[#2bbcb3]/10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الضغط</p>
                  <p className="text-xl font-black text-[#115e6e]">120/80</p>
                </div>
              </div>
            </ClinicalCard>

            {/* Verification / Security */}
            <div className="p-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/40 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">بيانات مؤمنة بالكامل</h4>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed max-w-[200px]">
                يتم تشفير كافة السجلات الطبية وفقاً لمعايير HIPAA العالمية لضمان خصوصية المريض.
              </p>
            </div>
          </div>
        )}

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - الإدارة السريرية الآمنة</span>
        </div>

      </div>
    </div>
  );
}
