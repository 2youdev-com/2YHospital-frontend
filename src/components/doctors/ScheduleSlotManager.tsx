'use client';

import { DAY_NAMES_AR } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
    <div className="space-y-3">
      {DAY_NAMES_AR.map((dayName, idx) => {
        const day = schedule[idx];
        return (
          <div
            key={idx}
            className={cn(
              'card transition-all',
              !day.enabled && 'opacity-60'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <label className={cn('flex items-center gap-3', !readonly && 'cursor-pointer')}>
                {!readonly && (
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => onToggle(idx)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                )}
                <span className="font-semibold text-gray-900">{dayName}</span>
              </label>
              {!day.enabled && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">إجازة</span>
              )}
            </div>

            {day.enabled && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">وقت البداية</label>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => onChange(idx, 'startTime', e.target.value)}
                    disabled={readonly}
                    className="input-field text-sm disabled:bg-gray-50"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">وقت النهاية</label>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => onChange(idx, 'endTime', e.target.value)}
                    disabled={readonly}
                    className="input-field text-sm disabled:bg-gray-50"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">مدة الموعد</label>
                  <select
                    value={day.slotDuration}
                    onChange={(e) => onChange(idx, 'slotDuration', Number(e.target.value))}
                    disabled={readonly}
                    className="input-field text-sm bg-white disabled:bg-gray-50"
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
