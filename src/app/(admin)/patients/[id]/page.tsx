// src/app/(admin)/patients/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner, Badge, ConfirmDialog } from '@/components/shared';
import MedicalRecordView from '@/components/patients/MedicalRecordView';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Phone, Droplets, Heart, AlertTriangle, 
  ShieldOff, ShieldCheck, User, Calendar, Fingerprint,
  Activity, FileText, ClipboardList, Sparkles, ChevronLeft
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { getCached, setCached, invalidateCache, TTL } from '@/lib/cache';
import toast from 'react-hot-toast';
import type { Patient, PatientSummary } from '@/types';

function DetailBlock({ label, value, icon: Icon, theme = 'slate' }: { 
  label: string; value: string; icon: React.ElementType; theme?: 'slate' | 'teal' | 'rose' 
}) {
  const themes = {
    slate: 'bg-white/40 border-white text-slate-800',
    teal: 'bg-teal-50/50 border-teal-100 text-[#115e6e]',
    rose: 'bg-rose-50/50 border-rose-100 text-rose-700'
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md", themes[theme])}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 flex-shrink-0 shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black opacity-60 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'records'>('info');
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    if (!id) return;

    const patientCacheKey = `patients:detail:${id}`;
    const cachedPatient = getCached<Patient>(patientCacheKey, TTL.MEDIUM);

    if (cachedPatient) {
      setPatient(cachedPatient);
      setIsLoading(false);
    } else {
      const listCached = getCached<{ data: Patient[]; total: number }>(`patients:list:1:200`, TTL.MEDIUM);
      const fromList = listCached?.data?.find((p) => p.id === id) ?? null;

      if (fromList) {
        setPatient(fromList);
        setCached(patientCacheKey, fromList);
        setIsLoading(false);
      } else {
        adminService.getUsers({ role: 'PATIENT', limit: 200 })
          .then((res) => {
            const p = (res.data as Patient[])?.find((u: Patient) => u.id === id) ?? null;
            setPatient(p);
            if (p) setCached(patientCacheKey, p);
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      }
    }

    const summaryCacheKey = `patients:summary:${id}`;
    const cachedSummary = getCached<PatientSummary>(summaryCacheKey, TTL.MEDIUM);
    if (cachedSummary) {
      setSummary(cachedSummary);
    } else {
      medicalRecordsService.getPatientSummary(id)
        .then((data) => {
          setSummary(data);
          setCached(summaryCacheKey, data);
        })
        .catch(() => {});
    }
  }, [id]);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await adminService.toggleUserStatus(id);
      toast.success('تم تغيير حالة المريض');
      setPatient((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, isActive: !prev.isActive };
        setCached(`patients:detail:${id}`, updated);
        invalidateCache('patients:list');
        return updated;
      });
    } catch {
      toast.error('فشل تغيير الحالة');
    } finally {
      setIsToggling(false);
      setShowToggle(false);
    }
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-12 text-center flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 font-bold">لم يتم العثور على بيانات المريض المطلوبة.</p>
        <button onClick={() => router.back()} className="mt-6 text-sm font-black text-[#115e6e] underline">العودة للخلف</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة ملف المريض" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لقائمة المرضى
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowToggle(true)}
              disabled={isToggling}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm border",
                patient.isActive 
                  ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
              )}
            >
              {patient.isActive ? <><ShieldOff className="w-4 h-4" /> تعليق الحساب</> : <><ShieldCheck className="w-4 h-4" /> تفعيل الحساب</>}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm transition-all hover:shadow-md">
          <div className="relative p-8 md:p-10 border-b border-slate-50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#115e6e]/20">
                  {patient.name?.[0] ?? 'م'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name || 'ملف غير مكتمل'}</h1>
                    <Badge className={patient.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}>
                      {patient.isActive ? 'نشط' : 'موقوف'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {patient.phone}</div>
                    <div className="flex items-center gap-1.5 font-mono"><Fingerprint className="w-3.5 h-3.5" /> {patient.mrn || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {patient.bloodType && (
                <div className="flex items-center gap-3 bg-rose-50/50 px-5 py-3 rounded-2xl border border-rose-100">
                  <Droplets className="w-6 h-6 text-rose-500" />
                  <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">فصيلة الدم</p>
                    <p className="text-lg font-black text-rose-700">{patient.bloodType}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-50 bg-white/40 p-2 gap-2">
            {[
              { id: 'info', label: 'المعلومات الشخصية', icon: User },
              { id: 'records', label: 'السجل الطبي المتكامل', icon: ClipboardList },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all",
                  activeTab === tab.id 
                    ? "bg-[#115e6e] text-white shadow-lg shadow-[#115e6e]/20" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-10">
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailBlock label="الجنس" value={patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : '—'} icon={User} />
                  <DetailBlock label="تاريخ الميلاد" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'} icon={Calendar} />
                  <DetailBlock label="رقم الهوية / الإقامة" value={patient.nationalId ?? '—'} icon={Fingerprint} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 flex flex-col gap-4">
                    <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> حساسية دوائية أو غذائية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(patient.allergies?.length ?? 0) > 0 ? (
                        patient.allergies!.map((a) => (
                          <span key={a} className="px-4 py-2 rounded-xl bg-white text-amber-800 text-xs font-black shadow-sm border border-amber-200">
                            {a}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm font-bold text-amber-400 italic">لا يوجد سجل حساسية معروف.</p>
                      )}
                    </div>
                  </div>

                  {/* Chronic Diseases */}
                  <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100 flex flex-col gap-4">
                    <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-5 h-5" /> الأمراض المزمنة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(patient.chronicDiseases?.length ?? 0) > 0 ? (
                        patient.chronicDiseases!.map((d) => (
                          <span key={d} className="px-4 py-2 rounded-xl bg-white text-rose-800 text-xs font-black shadow-sm border border-rose-200">
                            {d}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm font-bold text-rose-400 italic">لا يوجد أمراض مزمنة مسجلة.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div className="animate-in fade-in duration-500">
                {summary ? (
                  <MedicalRecordView summary={summary} />
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <LoadingSpinner />
                    <p className="text-sm font-bold text-slate-400 italic">جاري جلب السجل الطبي من قاعدة البيانات...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#115e6e]/5 text-[#115e6e] flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">تحليل حالة الملف</p>
              <p className="text-xs font-medium text-slate-500">تم اكتمال ملف المريض بنسبة 85%. يرجى مراجعة الوثائق المرفقة.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('records')}
            className="w-full md:w-auto px-6 py-3 bg-[#115e6e] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#115e6e]/20 hover:scale-105 transition-all text-center"
          >
            استعراض السجلات الكاملة
          </button>
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital لإدارة السجلات الطبية الرقمية</span>
        </div>

      </div>

      <ConfirmDialog
        isOpen={showToggle}
        title={patient.isActive ? 'تأكيد تعليق الحساب' : 'تأكيد تفعيل الحساب'}
        message={patient.isActive ? 'سيتم منع المريض من حجز مواعيد جديدة أو الوصول للخدمات الرقمية حتى يتم تفعيل الحساب مجدداً.' : 'سيتمكن المريض من العودة لاستخدام كافة خدمات المستشفى فوراً.'}
        confirmLabel="تأكيد العملية الآن"
        onConfirm={handleToggle}
        onCancel={() => setShowToggle(false)}
        danger={patient.isActive}
      />
    </div>
  );
}