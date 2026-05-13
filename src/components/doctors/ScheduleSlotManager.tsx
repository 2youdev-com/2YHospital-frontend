'use client';

import { DAY_NAMES_AR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Clock, Zap, AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react';

export interface DaySlot {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface ScheduleSlotManagerProps {
  schedule: DaySlot[];
  onChange: (idx: number, field: keyof DaySlot, value: string | number | boolean) => void;
  onToggle: (idx: number) => void;
  readonly?: boolean;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 دقيقة' },
  { value: 20, label: '20 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: '60 دقيقة' },
];

export default function ScheduleSlotManager({ schedule, onChange, onToggle, readonly = false }: ScheduleSlotManagerProps) {
  return (
    <div className="space-y-4">
      {DAY_NAMES_AR.map((dayName, idx) => {
        const day = schedule[idx];
        return (
          <div
            key={idx}
            className={cn(
              'group relative overflow-hidden bg-white rounded-[2rem] border transition-all hover:shadow-md',
              day.enabled ? 'border-teal-100 shadow-sm' : 'border-slate-100 opacity-70 bg-slate-50/50'
            )}
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div 
                  onClick={() => !readonly && onToggle(idx)}
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer',
                    day.enabled ? 'bg-[#115e6e] text-white shadow-[#115e6e]/10' : 'bg-slate-200 text-slate-400'
                  )}
                >
                  {day.enabled ? <CheckCircle2 className="w-7 h-7" /> : <MinusCircle className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{dayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {day.enabled ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">متاح للعمل</span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">إجازة أسبوعية</span>
                    )}
                  </div>
                </div>
              </div>

              {day.enabled && (
                <div className="flex-1 max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Start Time */}
                  <div className="relative group/input">
                    <label className="absolute right-4 top-2 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">بداية العمل</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => onChange(idx, 'startTime', e.target.value)}
                        disabled={readonly}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-4 pl-10 pt-6 pb-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#115e6e]/20 focus:border-[#115e6e] transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="relative group/input">
                    <label className="absolute right-4 top-2 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">نهاية العمل</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => onChange(idx, 'endTime', e.target.value)}
                        disabled={readonly}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-4 pl-10 pt-6 pb-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#115e6e]/20 focus:border-[#115e6e] transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="relative group/input">
                    <label className="absolute right-4 top-2 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">مدة الجلسة</label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                      <select
                        value={day.slotDuration}
                        onChange={(e) => onChange(idx, 'slotDuration', Number(e.target.value))}
                        disabled={readonly}
                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl pr-4 pl-10 pt-6 pb-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#115e6e]/20 focus:border-[#115e6e] transition-all cursor-pointer"
                      >
                        {DURATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Decoration */}
            {day.enabled && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[#115e6e]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
