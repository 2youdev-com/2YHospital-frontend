'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/shared';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { appointmentsService } from '@/services/appointments.service';
import { CalendarDays } from 'lucide-react';
import type { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    appointmentsService.getMyAppointments({ limit: 50 })
      .then((res) => setAppointments(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Topbar title="مواعيدي" />
      <div className="p-6">
        <PageHeader title="مواعيدي" description="متابعة المواعيد القادمة والسابقة" />
        {isLoading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState title="لا توجد مواعيد" description="يمكنك حجز موعد جديد من صفحة البحث والحجز" icon={CalendarDays} />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                href={`/patient/appointments/${appointment.id}`}
                showPatient={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
