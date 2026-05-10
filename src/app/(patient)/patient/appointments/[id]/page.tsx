'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { ConfirmDialog, LoadingSpinner } from '@/components/shared';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Calendar, Clock, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

export default function PatientAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    appointmentsService.getMyAppointment(id)
      .then(setAppointment)
      .catch(() => toast.error('لم يتم العثور على الموعد'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    try {
      await appointmentsService.cancel(id, 'إلغاء من تطبيق المريض');
      toast.success('تم إلغاء الموعد');
      router.push('/patient/appointments');
    } catch {
      toast.error('فشل إلغاء الموعد');
    }
    setShowCancel(false);
  };

  if (isLoading) return <><Topbar title="تفاصيل الموعد" /><LoadingSpinner /></>;
  if (!appointment) return <div className="p-6 text-gray-500">لم يتم العثور على الموعد</div>;

  return (
    <div>
      <Topbar title="تفاصيل الموعد" />
      <div className="p-6 max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">تفاصيل الموعد</h1>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow icon={Stethoscope} label="الطبيب" value={appointment.doctor.name} />
            <InfoRow icon={Stethoscope} label="التخصص" value={appointment.doctor.specialty} />
            <InfoRow icon={Calendar} label="التاريخ" value={formatDate(appointment.date)} />
            <InfoRow icon={Clock} label="الوقت" value={appointment.time} />
          </div>
          {appointment.status === 'CONFIRMED' || appointment.status === 'PENDING' ? (
            <div className="pt-4 border-t border-gray-100">
              <button onClick={() => setShowCancel(true)} className="btn-danger text-sm">
                إلغاء الموعد
              </button>
            </div>
          ) : null}
        </div>
        <ConfirmDialog
          isOpen={showCancel}
          title="إلغاء الموعد"
          message="هل أنت متأكد من إلغاء هذا الموعد؟"
          confirmLabel="نعم، إلغاء"
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          danger
        />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
