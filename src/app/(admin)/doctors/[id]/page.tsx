'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import { LoadingSpinner, Badge } from '@/components/shared';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Phone, Calendar, Star, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Doctor, Appointment } from '@/types';

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      doctorsService.getProfile(id),
      appointmentsService.getAllAppointments({ doctorId: id, limit: 10 }),
    ])
      .then(([doc, appts]) => { setDoctor(doc); setAppointments(appts.data || []); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Topbar title="ملف الطبيب" /><LoadingSpinner /></>;
  if (!doctor) return <div className="p-6 text-gray-500">لم يتم العثور على الطبيب</div>;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملف الطبيب" />
      <div className="p-6 max-w-3xl space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-l from-teal-600 to-blue-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-teal-700 font-black text-3xl">
                {doctor.name.replace('د. ', '').replace('دكتور ', '')[0]}
              </div>
              <div className="flex gap-2 mb-1">
                <Badge className={doctor.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                  {doctor.isActive ? '● نشط' : '○ غير نشط'}
                </Badge>
                <Link href={`/doctors/${id}/schedule`} className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> إدارة الجدول
                </Link>
              </div>
            </div>
            <h2 className="text-xl font-black text-gray-900">{doctor.name}</h2>
            <p className="text-sm text-teal-600 font-semibold mt-0.5">{doctor.specialty}</p>
            {doctor.branch && <p className="text-xs text-gray-400 mt-0.5">{doctor.branch}</p>}
            {doctor.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-2" dir="ltr">
                <Phone className="w-4 h-4 text-gray-400" />{doctor.phone}
              </p>
            )}
            {doctor.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">{doctor.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        {doctor.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'إجمالي المواعيد', value: doctor.stats.totalAppointments, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
              { label: 'مكتملة', value: doctor.stats.completedAppointments, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'ملغية', value: doctor.stats.cancelledAppointments, icon: XCircle, color: 'text-red-500 bg-red-50' },
              { label: 'رسوم الاستشارة', value: doctor.consultationFee !== undefined ? formatCurrency(doctor.consultationFee) : '—', icon: Clock, color: 'text-purple-600 bg-purple-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent appointments */}
        {appointments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">آخر المواعيد</h3>
              <Link href={`/appointments?doctorId=${id}`} className="text-xs text-blue-600 hover:text-blue-800">عرض الكل</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments.slice(0, 5).map((appt) => (
                <Link key={appt.id} href={`/appointments/${appt.id}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {appt.patient?.name?.[0] ?? 'م'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{appt.patient?.name ?? 'مريض'}</p>
                      <p className="text-xs text-gray-400">{formatDate(appt.date)} · {appt.time}</p>
                    </div>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
