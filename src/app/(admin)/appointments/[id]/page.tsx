'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate } from '@/lib/utils';
import { LoadingSpinner, ConfirmDialog } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import RescheduleModal from '@/components/appointments/RescheduleModal';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Calendar, Clock, User, Stethoscope, Building2, FileText, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

function InfoBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
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

  useEffect(() => {
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

  if (isLoading) return <><Topbar title="تفاصيل الموعد" /><LoadingSpinner /></>;
  if (!appt) return (
    <div className="p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <ArrowRight className="w-4 h-4" /> العودة
      </button>
      <p className="text-gray-500">لم يتم العثور على الموعد</p>
    </div>
  );

  const isActive = appt.status === 'CONFIRMED' || appt.status === 'PENDING';

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="تفاصيل الموعد" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة إلى المواعيد
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {appt.patient?.name?.[0] ?? 'م'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{appt.patient?.name ?? 'مريض'}</h2>
                <p className="text-sm text-gray-500">{appt.patient?.phone ?? ''}</p>
              </div>
            </div>
            <AppointmentStatusBadge status={appt.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock icon={Stethoscope} label="الطبيب" value={appt.doctor.name} />
            <InfoBlock icon={User} label="التخصص" value={appt.doctor.specialty} />
            <InfoBlock icon={Calendar} label="التاريخ" value={formatDate(appt.date)} />
            <InfoBlock icon={Clock} label="الوقت" value={appt.time} />
            {appt.branch && <InfoBlock icon={Building2} label="الفرع" value={appt.branch} />}
            {appt.reason && <InfoBlock icon={FileText} label="سبب الزيارة" value={appt.reason} />}
          </div>

          {appt.notes && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-semibold text-blue-700 mb-1">ملاحظات</p>
              <p className="text-sm text-blue-800">{appt.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">إجراءات</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowReschedule(true)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> إعادة الجدولة
              </button>
              <button
                onClick={() => setShowCancel(true)}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" /> إلغاء الموعد
              </button>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={showCancel}
          title="إلغاء الموعد"
          message="هل أنت متأكد من إلغاء هذا الموعد؟ سيتم إشعار المريض والطبيب."
          confirmLabel="نعم، إلغاء الموعد"
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
            toast.success('تم إعادة جدولة الموعد');
          }}
        />
      </div>
    </div>
  );
}
