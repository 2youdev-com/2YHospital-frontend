import { Pill } from 'lucide-react';
import type { Medication } from '@/types';

interface MedicationListProps {
  medications: Medication[];
  title?: string;
}

export default function MedicationList({ medications, title = 'الأدوية الحالية' }: MedicationListProps) {
  if (medications.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <Pill className="w-4 h-4 text-blue-500" />
        {title}
      </h3>
      <div className="space-y-2">
        {medications.map((med, i) => (
          <div key={i} className="flex items-start justify-between p-3 bg-blue-50 rounded-xl text-sm">
            <div>
              <p className="font-semibold text-gray-900">{med.name}</p>
              {med.instructions && (
                <p className="text-xs text-gray-500 mt-0.5">{med.instructions}</p>
              )}
              {med.duration && (
                <p className="text-xs text-gray-400 mt-0.5">المدة: {med.duration}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0 mr-4">
              <p className="text-blue-700 font-medium">{med.dosage}</p>
              <p className="text-xs text-gray-500">{med.frequency}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
