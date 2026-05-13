'use client';

import { useEffect, useState, useRef } from 'react';
import Topbar from '@/components/layout/Topbar';
import { medicalRecordsService } from '@/services/medical-records.service';
import { 
  FileText, Pill, ScanLine, TestTube2, 
  Activity, ShieldCheck, Sparkles, Zap, 
  ChevronLeft, Clock, Download, Share2,
  Calendar, Microscope, Heart
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import type { LabResult, Prescription, RadiologyReport, VisitHistory } from '@/types';
import toast from 'react-hot-toast';

type RecordTab = 'visits' | 'labs' | 'radiology' | 'meds';

export default function PatientMedicalRecordsPage() {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [radiology, setRadiology] = useState<RadiologyReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [visits, setVisits] = useState<VisitHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecordTab>('visits');
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    Promise.all([
      medicalRecordsService.getLabResults().catch(() => []),
      medicalRecordsService.getRadiologyReports().catch(() => []),
      medicalRecordsService.getPrescriptions().catch(() => []),
      medicalRecordsService.getVisitHistory().catch(() => []),
    ]).then(([labData, radiologyData, prescriptionData, visitData]) => {
      setLabs(labData);
      setRadiology(radiologyData);
      setPrescriptions(prescriptionData);
      setVisits(visitData);
    }).catch(() => {
      toast.error('تعذر تحميل بعض السجلات الطبية');
    }).finally(() => setIsLoading(false));
  }, []);

  const tabs: { id: RecordTab; label: string; icon: any; count: number }[] = [
    { id: 'visits', label: 'الزيارات السابقة', icon: Calendar, count: visits.length },
    { id: 'labs', label: 'التحاليل الطبية', icon: Microscope, count: labs.length },
    { id: 'radiology', label: 'تقارير الأشعة', icon: ScanLine, count: radiology.length },
    { id: 'meds', label: 'الوصفات والأدوية', icon: Pill, count: prescriptions.length },
  ];

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملفي الطبي" />
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-20 rounded-2xl bg-white/50 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-3xl bg-white/50 animate-pulse" />
          <div className="h-64 rounded-3xl bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="الأرشيف الصحي الرقمي" subtitle="وصول آمن وسهل لكافة سجلك الطبي" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Security Header */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 tracking-tight">سجل طبي مؤمن بالكامل</p>
              <p className="text-[10px] font-bold text-slate-400">نظام تشفير AES-256 للملفات الطبية الحساسة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#115e6e] hover:border-[#115e6e]/20 transition-all shadow-sm">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#115e6e] hover:border-[#115e6e]/20 transition-all shadow-sm">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap border-2 shadow-sm",
                activeTab === tab.id
                  ? "bg-[#115e6e] text-white border-[#115e6e] shadow-lg shadow-[#115e6e]/20 translate-y-[-2px]"
                  : "bg-white text-slate-500 border-white hover:border-slate-100"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-teal-300" : "text-slate-300")} />
              {tab.label}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Records Content Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-8 space-y-6">
            
            {/* Tab: Visit History */}
            {activeTab === 'visits' && (
              <div className="space-y-4">
                {visits.length > 0 ? visits.map((visit) => (
                   <RecordItem key={visit.id} title={visit.specialty} subtitle={`د. ${visit.doctorName}`} date={visit.date} icon={FileText} badge={visit.specialty} />
                )) : <EmptyRecords message="لا توجد زيارات سابقة مسجلة" />}
              </div>
            )}

            {/* Tab: Lab Results */}
            {activeTab === 'labs' && (
              <div className="space-y-4">
                {labs.length > 0 ? labs.map((lab) => (
                   <RecordItem key={lab.id} title={lab.testName} subtitle={lab.requestedBy || 'طبيب'} date={lab.date} icon={TestTube2} badge={lab.status} statusColor={lab.status === 'NORMAL' ? 'emerald' : 'rose'} />
                )) : <EmptyRecords message="لا توجد نتائج تحاليل مخبرية" />}
              </div>
            )}

            {/* Tab: Radiology */}
            {activeTab === 'radiology' && (
              <div className="space-y-4">
                {radiology.length > 0 ? radiology.map((report) => (
                  <RecordItem key={report.id} title={report.type} subtitle={report.findings} date={report.date} icon={ScanLine} isComplex />
                )) : <EmptyRecords message="لا توجد تقارير أشعة" />}
              </div>
            )}

            {/* Tab: Medications */}
            {activeTab === 'meds' && (
              <div className="space-y-4">
                {prescriptions.length > 0 ? prescriptions.map((rx) => (
                  <RecordItem key={rx.id} title={`وصفة طبية - ${rx.doctorName}`} subtitle={rx.medications.map(m => m.name).join('، ')} date={rx.date} icon={Pill} isMed />
                )) : <EmptyRecords message="لا توجد وصفات طبية حالية" />}
              </div>
            )}

          </div>
        </div>

        {/* Health Insights Sparkle */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 text-white flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-xl font-black mb-1">تحليل السجل بواسطة AI</h3>
              <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                هل تجد صعوبة في فهم المصطلحات الطبية في تقاريرك؟ مساعدنا الذكي يمكنه شرح النتائج لك بتبسيط تام.
              </p>
            </div>
            <button className="px-8 py-3.5 bg-white text-indigo-900 font-black text-sm rounded-2xl hover:bg-indigo-50 transition-all shadow-xl">
              تحدث مع المساعد الآن
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function RecordItem({ title, subtitle, date, icon: Icon, badge, statusColor = 'blue', isComplex = false, isMed = false }: any) {
  return (
    <div className="group bg-slate-50/50 hover:bg-white rounded-3xl p-5 md:p-6 border border-transparent hover:border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#115e6e] group-hover:bg-[#115e6e]/5 transition-all shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
            <h4 className="text-base font-black text-slate-800 truncate">{title}</h4>
            {badge && (
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                statusColor === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                statusColor === 'rose' ? "bg-rose-50 text-rose-600 border-rose-100" :
                "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {badge}
              </span>
            )}
          </div>
          <p className={cn("text-sm font-medium text-slate-500 leading-relaxed mb-3", isComplex && "line-clamp-2")}>{subtitle}</p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(date)}
            </span>
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {formatDate(date, 'HH:mm')}
            </span>
            <button className="mr-auto text-[10px] font-black text-[#115e6e] hover:underline opacity-0 group-hover:opacity-100 transition-all">
              عرض التفاصيل الكاملة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyRecords({ message }: { message: string }) {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8 text-slate-200" />
      </div>
      <p className="text-sm font-bold text-slate-400">{message}</p>
    </div>
  );
}

