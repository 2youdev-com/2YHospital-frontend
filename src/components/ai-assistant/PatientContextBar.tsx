'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface PatientContextBarProps {
  summary: string;
  isLoading: boolean;
  title?: string;
  accentColor?: 'blue' | 'teal';
}

export default function PatientContextBar({
  summary,
  isLoading,
  title = 'ملخص المريض',
  accentColor = 'teal',
}: PatientContextBarProps) {
  const colors = {
    teal: { icon: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
    blue: { icon: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  };
  const c = colors[accentColor];

  return (
    <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
      <div className="px-4 py-4 border-b border-gray-100">
        <h3 className={`font-semibold text-gray-800 flex items-center gap-2 text-sm`}>
          <Sparkles className={`w-4 h-4 ${c.icon}`} />
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جارٍ التحميل...</span>
          </div>
        ) : summary ? (
          <p className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-3 rounded-xl border ${c.bg}`}>
            {summary}
          </p>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">لا يوجد ملخص</p>
        )}
      </div>
    </div>
  );
}
