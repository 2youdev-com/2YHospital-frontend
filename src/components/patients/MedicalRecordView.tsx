'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import LabResultItem from './LabResultItem';
import RadiologyReportItem from './RadiologyReportItem';
import MedicationList from './MedicationList';
import { FlaskConical, RadioTower, Pill, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { PatientSummary } from '@/types';

interface MedicalRecordViewProps {
  summary: PatientSummary;
}

type Tab = 'labs' | 'radiology' | 'medications' | 'visits';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'labs', label: 'التحاليل', icon: FlaskConical },
  { id: 'radiology', label: 'الأشعة', icon: RadioTower },
  { id: 'medications', label: 'الأدوية', icon: Pill },
  { id: 'visits', label: 'الزيارات', icon: Clock },
];

export default function MedicalRecordView({ summary }: MedicalRecordViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('labs');

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'labs' && (
        <div className="space-y-3">
          {summary.labResultsSummary.length === 0 ? (
            <EmptyTab label="لا توجد نتائج مختبر" />
          ) : (
            summary.labResultsSummary.map((r) => <LabResultItem key={r.id} result={r} />)
          )}
        </div>
      )}

      {activeTab === 'radiology' && (
        <div className="space-y-3">
          <EmptyTab label="لا توجد تقارير أشعة" />
        </div>
      )}

      {activeTab === 'medications' && (
        <MedicationList medications={summary.currentMedications} />
      )}

      {activeTab === 'visits' && (
        <div className="space-y-3">
          {summary.recentVisits.length === 0 ? (
            <EmptyTab label="لا توجد زيارات سابقة" />
          ) : (
            summary.recentVisits.map((visit) => (
              <div key={visit.id} className="card text-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{visit.specialty}</p>
                    <p className="text-gray-500 text-xs">{visit.doctorName}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(visit.date)}</span>
                </div>
                {visit.diagnosis && (
                  <p className="text-gray-700 text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">التشخيص: </span>{visit.diagnosis}
                  </p>
                )}
                {visit.notes && (
                  <p className="text-gray-600 text-xs mt-1">{visit.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="text-center py-10 text-gray-400 text-sm">{label}</div>
  );
}
