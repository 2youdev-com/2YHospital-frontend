'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doctorsService } from '@/services/doctors.service';
import { LoadingSpinner, PageHeader } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Clock } from 'lucide-react';
import { DAY_NAMES_AR } from '@/lib/utils';
import type { Doctor } from '@/types';

export default function AdminDoctorSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    doctorsService.getProfile(id)
      .then(setDoctor)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Topbar title="جدول الطبيب" /><LoadingSpinner /></>;
  if (!doctor) return <div className="p-6 text-gray-500">لم يتم العثور على الطبيب</div>;

  const schedule = doctor.schedule ?? [];

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="جدول الطبيب" />
      <div className="p-6 max-w-2xl space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        {/* Doctor info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {doctor.name.replace('د. ', '')[0]}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-sm text-teal-600">{doctor.specialty}</p>
          </div>
        </div>

        <PageHeader title="أوقات العمل" description="الجدول الأسبوعي للطبيب (قراءة فقط — يُعدّل من بوابة الطبيب)" />

        {schedule.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center text-gray-400">
            <Clock className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">لم يحدد الطبيب أوقات عمله بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAY_NAMES_AR.map((dayName, idx) => {
              const daySlots = schedule.filter(s => s.dayOfWeek === idx);
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${daySlots.length > 0 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    <span className={`text-sm font-semibold ${daySlots.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{dayName}</span>
                  </div>
                  {daySlots.length === 0 ? (
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">إجازة</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {daySlots.map((slot) => (
                        <span
                          key={slot.id}
                          className={`text-xs font-mono px-3 py-1.5 rounded-xl font-medium ${slot.isBlocked ? 'bg-red-100 text-red-600 line-through' : 'bg-teal-100 text-teal-700'}`}
                          dir="ltr"
                        >
                          {slot.startTime} — {slot.endTime}
                          <span className="text-[10px] opacity-60 mr-1">({slot.slotDurationMinutes}د)</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
