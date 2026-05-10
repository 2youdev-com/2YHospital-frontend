import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import { CalendarDays, Clock, Stethoscope, ChevronLeft } from 'lucide-react';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  href: string;
  showPatient?: boolean;
  showDoctor?: boolean;
}

export default function AppointmentCard({ appointment, href, showPatient = false, showDoctor = true }: AppointmentCardProps) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          {showPatient && appointment.patient && (
            <p className="font-semibold text-gray-900 truncate">{appointment.patient.name}</p>
          )}
          {showDoctor && (
            <p className={`${showPatient ? 'text-sm text-gray-600' : 'font-semibold text-gray-900'} flex items-center gap-1.5 truncate`}>
              <Stethoscope className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {appointment.doctor.name}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1" dir="ltr">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <AppointmentStatusBadge status={appointment.status} />
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}
