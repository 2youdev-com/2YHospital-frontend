// src/app/(admin)/patients/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner, Badge, ConfirmDialog } from '@/components/shared';
import MedicalRecordView from '@/components/patients/MedicalRecordView';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Phone, Droplets, Heart, AlertTriangle, ShieldOff, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getCached, setCached, invalidateCache, TTL } from '@/lib/cache';
import toast from 'react-hot-toast';
import type { Patient, PatientSummary } from '@/types';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'records'>('info');

  useEffect(() => {
    if (!id) return;

    // FIX: Try to find patient in the cached list first (avoids fetching all patients again),
    // then fall back to fetching all patients and caching per-patient.
    const patientCacheKey = `patients:detail:${id}`;
    const cachedPatient = getCached<Patient>(patientCacheKey, TTL.MEDIUM);

    if (cachedPatient) {
      setPatient(cachedPatient);
      setIsLoading(false);
    } else {
      // Try the list cache first
      const listCached = getCached<{ data: Patient[]; total: number }>(`patients:list:1:200`, TTL.MEDIUM);
      const fromList = listCached?.data?.find((p) => p.id === id) ?? null;

      if (fromList) {
        setPatient(fromList);
        setCached(patientCacheKey, fromList);
        setIsLoading(false);
      } else {
        // Last resort: fetch the list and find our patient
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

    // Load medical summary in parallel
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

  if (isLoading) return <><Topbar title="ملف المريض" /><LoadingSpinner /></>;
  if (!patient) return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>
        <p className="text-gray-500">لم يتم العثور على المريض</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-6 max-w-3xl space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-20 bg-gradient-to-l from-blue-600 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-blue-700 font-black text-2xl">
                {patient.name?.[0] ?? 'م'}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={patient.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}>
                  {patient.isActive ? 'نشط' : 'موقوف'}
                </Badge>
                <button
                  onClick={() => setShowToggle(true)}
                  disabled={isToggling}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${patient.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
                >
                  {patient.isActive ? <><ShieldOff className="w-3.5 h-3.5" /> تعليق</> : <><ShieldCheck className="w-3.5 h-3.5" /> تفعيل</>}
                </button>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{patient.name || <span className="text-gray-400 text-base font-normal italic">لم يكتمل الملف</span>}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-gray-400" />{patient.phone}
            </p>
            {patient.mrn && (
              <p className="text-xs text-gray-400 mt-1 font-mono">رقم الملف: {patient.mrn}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-2xl overflow-hidden">
          {(['info', 'records'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'info' ? 'المعلومات الشخصية' : 'السجل الطبي'}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'الجنس', value: patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : '—' },
                { label: 'تاريخ الميلاد', value: patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—' },
                { label: 'رقم الهوية', value: patient.nationalId ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
              {patient.bloodType && (
                <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-red-400 mb-0.5">فصيلة الدم</p>
                    <p className="text-lg font-black text-red-700">{patient.bloodType}</p>
                  </div>
                </div>
              )}
            </div>

            {(patient.allergies?.length ?? 0) > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> حساسية — تنبيه
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies!.map((a) => (
                    <span key={a} className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800 font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {(patient.chronicDiseases?.length ?? 0) > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4" /> أمراض مزمنة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases!.map((d) => (
                    <span key={d} className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 p-6">
            {summary ? <MedicalRecordView summary={summary} /> : <LoadingSpinner />}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showToggle}
        title={patient.isActive ? 'تعليق الحساب' : 'تفعيل الحساب'}
        message={patient.isActive ? 'هل تريد تعليق حساب هذا المريض؟ لن يتمكن من حجز مواعيد.' : 'هل تريد تفعيل حساب هذا المريض؟'}
        confirmLabel="تأكيد"
        onConfirm={handleToggle}
        onCancel={() => setShowToggle(false)}
        danger={patient.isActive}
      />
    </div>
  );
}