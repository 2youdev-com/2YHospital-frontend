import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import { EmptyState } from '@/components/shared';
import { CalendarDays, Eye } from 'lucide-react';
import type { Appointment } from '@/types';

interface AppointmentTableProps {
  appointments: Appointment[];
  basePath?: string; // e.g. '/appointments' or '/portal/appointments'
  showPatient?: boolean;
  showDoctor?: boolean;
}

export default function AppointmentTable({
  appointments,
  basePath = '/appointments',
  showPatient = true,
  showDoctor = true,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return <EmptyState title="لا توجد مواعيد" icon={CalendarDays} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {showPatient && <th className="text-right px-4 py-3 font-medium text-gray-600">المريض</th>}
            {showDoctor && <th className="text-right px-4 py-3 font-medium text-gray-600">الطبيب</th>}
            <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">الوقت</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
              {showPatient && (
                <td className="px-4 py-3 font-medium text-gray-900">{appt.patient?.name ?? '—'}</td>
              )}
              {showDoctor && (
                <td className="px-4 py-3 text-gray-700">{appt.doctor.name}</td>
              )}
              <td className="px-4 py-3 text-gray-500">{formatDate(appt.date)}</td>
              <td className="px-4 py-3 text-gray-500" dir="ltr">{appt.time}</td>
              <td className="px-4 py-3">
                <AppointmentStatusBadge status={appt.status} />
              </td>
              <td className="px-4 py-3">
                <Link href={`${basePath}/${appt.id}`} className="text-blue-600 hover:text-blue-800 p-1 inline-flex">
                  <Eye className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
