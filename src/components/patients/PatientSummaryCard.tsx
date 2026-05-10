import { Badge } from '@/components/shared';
import { Phone, Heart, AlertTriangle, Droplets } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Patient } from '@/types';

interface PatientSummaryCardProps {
  patient: Patient;
  compact?: boolean;
}

export default function PatientSummaryCard({ patient, compact = false }: PatientSummaryCardProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
          {patient.name?.[0] ?? 'م'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{patient.name ?? '—'}</h3>
            <Badge className={patient.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {patient.isActive ? 'نشط' : 'موقوف'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5" dir="ltr">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            {patient.phone}
          </p>
        </div>
      </div>

      {/* Medical info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {patient.gender && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">الجنس</p>
            <p className="font-medium text-gray-800">{patient.gender === 'MALE' ? 'ذكر' : 'أنثى'}</p>
          </div>
        )}
        {patient.bloodType && (
          <div className="bg-red-50 rounded-lg p-2.5 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">فصيلة الدم</p>
              <p className="font-bold text-red-700">{patient.bloodType}</p>
            </div>
          </div>
        )}
        {patient.dateOfBirth && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">تاريخ الميلاد</p>
            <p className="font-medium text-gray-800">{formatDate(patient.dateOfBirth)}</p>
          </div>
        )}
        {patient.nationalId && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">رقم الهوية</p>
            <p className="font-medium text-gray-800 font-mono text-xs">{patient.nationalId}</p>
          </div>
        )}
      </div>

      {!compact && (
        <>
          {/* Allergies */}
          {(patient.allergies?.length ?? 0) > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-orange-700 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> حساسية
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies!.map((a) => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic diseases */}
          {(patient.chronicDiseases?.length ?? 0) > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5" /> أمراض مزمنة
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patient.chronicDiseases!.map((d) => (
                  <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{d}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
