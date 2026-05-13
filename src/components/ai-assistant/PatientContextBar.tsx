'use client';

import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const accent = accentColor === 'teal' ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-blue-700 bg-blue-50 border-blue-100';

  return (
    <aside className="hidden w-80 flex-shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-200 p-4">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-950">
          <Sparkles className="h-4 w-4 text-teal-600" />
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">يعرض هذا القسم ملخصا آمنا فقط، وليس بيانات خام من النظام.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            جار التحميل...
          </div>
        ) : summary ? (
          <div className={cn('rounded-xl border p-3 text-sm leading-7', accent)}>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" />
              سياق مصرح به
            </div>
            <p className="whitespace-pre-wrap text-slate-700">{summary}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            لا يوجد ملخص متاح
          </div>
        )}
      </div>
    </aside>
  );
}
