'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner } from '@/components/shared';
import MedicalRecordView from '@/components/patients/MedicalRecordView';
import PatientSummaryCard from '@/components/patients/PatientSummaryCard';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Bot, Sparkles, User, 
  Activity, ShieldCheck, Zap, Phone,
  Calendar, FileText, Heart
} from 'lucide-react';
import Link from 'next/link';
import type { PatientSummary } from '@/types';
import toast from 'react-hot-toast';

export default function DoctorPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    let ignore = false;
    if (!id) return;

    setIsLoading(true);
    medicalRecordsService.getPatientSummary(id)
      .then(res => { if (!ignore) setSummary(res); })
      .catch(() => { if (!ignore) toast.error('فشل تحميل سجل المريض'); })
      .finally(() => { if (!ignore) setIsLoading(false); });

    return () => { ignore = true; };
  }, [id]);

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="h-96 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
      </div>
    </div>
  );

  if (!summary) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-12 text-center text-slate-500 font-bold">لم يتم العثور على بيانات المريض</div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="السجل الطبي الكامل" subtitle="مراجعة التاريخ المرضي والتقارير السريرية" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة للمواعيد
          </button>
          
          <Link
            href={`/portal/ai-assistant?patientId=${id}`}
            className="group flex items-center gap-3 bg-slate-900 text-white text-sm font-black px-6 py-3 rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2bbcb3] to-[#115e6e] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            تحليل السجل بواسطة AI
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
          </Link>
        </div>

        {/* Patient Identity Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
          <div className="relative h-24 bg-gradient-to-r from-[#115e6e] to-[#2bbcb3]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]" />
          </div>
          <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row items-end gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-[#115e6e] font-black text-4xl border border-slate-100">
                {summary.patient.name?.[0] ?? 'م'}
              </div>
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-slate-800">{summary.patient.name}</h2>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">
                  #{id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {summary.patient.gender === 'MALE' ? 'ذكر' : 'أنثى'}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> {summary.patient.bloodType ?? 'O+'}
                </span>
                {summary.patient.phone && (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5" dir="ltr">
                    <Phone className="w-3.5 h-3.5" /> {summary.patient.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PatientSummaryCard patient={summary.patient} />
          
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#115e6e]/5 text-[#115e6e] flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-2">إمكانية الوصول للملف</h4>
            <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
              لديك صلاحية كاملة لمراجعة السجل الطبي لهذا المريض. كافة العمليات مسجلة ضمن سجلات التدقيق السريري.
            </p>
          </div>
        </div>

        {/* Detailed Medical Records View (Tabs/History) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden p-2 md:p-4">
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">تفاصيل السجل الطبي</h3>
          </div>
          <MedicalRecordView summary={summary} />
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>التصفح الآمن لسجلات المرضى - 2YHospital v2.0</span>
        </div>

      </div>
    </div>
  );
}
