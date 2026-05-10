import Link from 'next/link';
import { Badge } from '@/components/shared';
import { Phone, Star, Eye, Calendar } from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
  basePath?: string;
}

export default function DoctorCard({ doctor, basePath = '/doctors' }: DoctorCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
          {getInitials(doctor.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{doctor.name}</p>
          <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
          {doctor.branch && <p className="text-xs text-gray-400 mt-0.5">{doctor.branch}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {doctor.phone && (
              <span className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
                <Phone className="w-3 h-3" />{doctor.phone}
              </span>
            )}
            {doctor.consultationFee !== undefined && (
              <span className="text-xs text-gray-500">{formatCurrency(doctor.consultationFee)}</span>
            )}
            {doctor.stats?.rating !== undefined && (
              <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {doctor.stats.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <Badge className={doctor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
          {doctor.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
        <div className="flex items-center gap-3">
          <Link href={`${basePath}/${doctor.id}/schedule`} className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> الجدول
          </Link>
          <Link href={`${basePath}/${doctor.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> عرض
          </Link>
        </div>
      </div>
    </div>
  );
}
