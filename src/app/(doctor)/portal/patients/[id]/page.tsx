'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner } from '@/components/shared';
import MedicalRecordView from '@/components/patients/MedicalRecordView';
import PatientSummaryCard from '@/components/patients/PatientSummaryCard';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Bot } from 'lucide-react';
import Link from 'next/link';
import type { PatientSummary } from '@/types';

export default function DoctorPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    medicalRecordsService.getPatientSummary(id)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Topbar title="ملف المريض" /><LoadingSpinner /></>;
  if (!summary) return <div className="p-6 text-gray-500">لم يتم العثور على بيانات المريض</div>;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملف المريض" />
      <div className="p-6 max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowRight className="w-4 h-4" /> العودة
          </button>
          <Link
            href={`/portal/ai-assistant?patientId=${id}`}
            className="flex items-center gap-2 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Bot className="w-4 h-4" /> ملخص ذكي
          </Link>
        </div>

        <PatientSummaryCard patient={summary.patient} />

        {/* Tabs for medical records */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <MedicalRecordView summary={summary} />
        </div>
      </div>
    </div>
  );
}
