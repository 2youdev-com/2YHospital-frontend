'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { LoadingSpinner } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, FileText, Bot, AlertTriangle, Pill, Phone, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Appointment, PatientSummary } from '@/types';

export default function DoctorAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    appointmentsService.getMyAppointment(id)
      .then(async (a) => {
        setAppt(a);
        if (a.patient?.id) {
          medicalRecordsService.getPatientSummary(a.patient.id)
            .then(setSummary).catch(() => {});
        }
      })
      .catch(() => toast.error('لم يتم العثور على الموعد'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Topbar title="تفاصيل الموعد" /><LoadingSpinner /></>;
  if (!appt) return <div className="p-6 text-gray-500">لم يتم العثور على الموعد</div>;

  const isActive = appt.status === 'CONFIRMED' || appt.status === 'PENDING';

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-6 max-w-3xl space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        {/* Patient card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              {appt.patient?.name?.[0] ?? 'م'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900">{appt.patient?.name ?? 'مريض'}</h2>
                  {appt.patient?.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />{appt.patient.phone}
                    </p>
                  )}
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">التاريخ</p>
                <p className="font-semibold text-gray-900">{formatDate(appt.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">الوقت</p>
                <p className="font-semibold text-gray-900" dir="ltr">{appt.time}</p>
              </div>
            </div>
          </div>

          {appt.reason && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">سبب الزيارة</p>
              <p className="text-sm text-blue-800">{appt.reason}</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {isActive && (
          <div className="grid grid-cols-3 gap-3">
            {appt.patient?.id && (
              <Link href={`/portal/patients/${appt.patient.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-blue-200 transition-all text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-700">السجل الطبي</p>
              </Link>
            )}
            <Link href={`/portal/notes/${id}`}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-teal-200 transition-all text-center">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700">ملاحظات الزيارة</p>
            </Link>
            {appt.patient?.id && (
              <Link href={`/portal/ai-assistant?patientId=${appt.patient.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-purple-200 transition-all text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-gray-700">ملخص ذكي</p>
              </Link>
            )}
          </div>
        )}

        {/* Patient summary highlights */}
        {summary && (
          <div className="space-y-3">
            {summary.activeAlerts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" /> تنبيهات سريرية
                </h3>
                {summary.activeAlerts.map((a, i) => (
                  <p key={i} className="text-sm text-orange-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />{a}
                  </p>
                ))}
              </div>
            )}
            {(summary.patient.allergies?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" /> الحساسية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.patient.allergies!.map(a => (
                    <span key={a} className="px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {summary.currentMedications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2 text-sm">
                  <Pill className="w-4 h-4 text-blue-500" /> الأدوية الحالية
                </h3>
                <div className="space-y-2">
                  {summary.currentMedications.map((med, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2 text-sm">
                      <span className="font-semibold text-gray-900">{med.name}</span>
                      <span className="text-gray-500 text-xs">{med.dosage} · {med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
