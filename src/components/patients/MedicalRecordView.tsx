'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import LabResultItem from './LabResultItem';
import RadiologyReportItem from './RadiologyReportItem';
import MedicationList from './MedicationList';
import { 
  FlaskConical, RadioTower, Pill, 
  Clock, FileText, ChevronLeft,
  Activity, Info, Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { PatientSummary } from '@/types';

interface MedicalRecordViewProps {
  summary: PatientSummary;
}

type Tab = 'labs' | 'radiology' | 'medications' | 'visits';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'labs', label: 'النتائج المخبرية', icon: FlaskConical, color: 'text-blue-500' },
  { id: 'radiology', label: 'تقارير الأشعة', icon: RadioTower, color: 'text-purple-500' },
  { id: 'medications', label: 'الأدوية النشطة', icon: Pill, color: 'text-emerald-500' },
  { id: 'visits', label: 'تاريخ الزيارات', icon: Clock, color: 'text-amber-500' },
];

export default function MedicalRecordView({ summary }: MedicalRecordViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('labs');

  return (
    <div className="flex flex-col h-full">
      {/* Premium Tabs */}
      <div className="flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-[1.5rem] mb-8 border border-slate-100 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap',
              activeTab === id
                ? 'bg-white text-slate-800 shadow-md shadow-slate-200/50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            )}
          >
            <Icon className={cn('w-4 h-4', activeTab === id ? color : 'text-slate-300')} />
            <span className="uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 min-h-[400px]">
        {activeTab === 'labs' && (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {summary.labResultsSummary.length === 0 ? (
              <EmptyTab label="لا توجد نتائج مختبر مسجلة حالياً" icon={FlaskConical} />
            ) : (
              summary.labResultsSummary.map((r) => <LabResultItem key={r.id} result={r} />)
            )}
          </div>
        )}

        {activeTab === 'radiology' && (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <EmptyTab label="لا توجد تقارير أشعة متاحة في السجل" icon={RadioTower} />
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MedicationList medications={summary.currentMedications} />
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {summary.recentVisits.length === 0 ? (
              <EmptyTab label="لا يوجد سجل زيارات سابقة لهذا المريض" icon={Clock} />
            ) : (
              summary.recentVisits.map((visit) => (
                <div 
                  key={visit.id} 
                  className="group relative bg-white rounded-[2rem] border border-slate-100 p-6 transition-all hover:border-[#115e6e]/20 hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#115e6e] flex items-center justify-center group-hover:bg-[#115e6e]/5 transition-colors">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{visit.specialty}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">بإشراف: {visit.doctorName}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{formatDate(visit.date)}</span>
                  </div>
                  
                  {visit.diagnosis && (
                    <div className="bg-slate-50/80 rounded-2xl p-4 mb-3 border border-slate-100/50">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        <Activity className="w-3 h-3" /> التشخيص السريري
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{visit.diagnosis}</p>
                    </div>
                  )}
                  
                  {visit.notes && (
                    <div className="flex items-start gap-3 px-2">
                      <Info className="w-3.5 h-3.5 text-slate-300 mt-1" />
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">{visit.notes}</p>
                    </div>
                  )}
                  
                  <button className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10px] font-black text-[#115e6e]">
                    التفاصيل <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTab({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-3xl bg-white text-slate-200 flex items-center justify-center shadow-sm mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}
