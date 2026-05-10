'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doctorsService } from '@/services/doctors.service';
import { LoadingSpinner, PageHeader } from '@/components/shared';
import ScheduleSlotManager, { type DaySlot } from '@/components/doctors/ScheduleSlotManager';
import Topbar from '@/components/layout/Topbar';
import { Save, ArrowRight } from 'lucide-react';
import { DAY_NAMES_AR } from '@/lib/utils';
import toast from 'react-hot-toast';

const defaultSchedule: DaySlot[] = DAY_NAMES_AR.map(() => ({
  enabled: false, startTime: '09:00', endTime: '17:00', slotDuration: 30,
}));

export default function DoctorSchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<DaySlot[]>(defaultSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    doctorsService.getMyProfile().then((profile) => {
      if (profile.schedule?.length) {
        const merged = [...defaultSchedule];
        profile.schedule.forEach((slot) => {
          if (slot.dayOfWeek >= 0 && slot.dayOfWeek < 7) {
            merged[slot.dayOfWeek] = { enabled: !slot.isBlocked, startTime: slot.startTime, endTime: slot.endTime, slotDuration: slot.slotDurationMinutes };
          }
        });
        setSchedule(merged);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const handleToggle = (idx: number) => setSchedule((p) => p.map((d, i) => i === idx ? { ...d, enabled: !d.enabled } : d));
  const handleChange = (idx: number, field: keyof DaySlot, value: string | number | boolean) =>
    setSchedule((p) => p.map((d, i) => i === idx ? { ...d, [field]: value } : d));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await doctorsService.setSchedule(schedule.map((d, idx) => ({
        dayOfWeek: idx, startTime: d.startTime, endTime: d.endTime,
        slotDurationMinutes: d.slotDuration, isBlocked: !d.enabled,
      })));
      toast.success('تم حفظ الجدول بنجاح');
    } catch { toast.error('فشل حفظ الجدول'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <><Topbar title="إدارة الجدول" /><LoadingSpinner /></>;

  return (
    <div>
      <Topbar title="إدارة الجدول" />
      <div className="p-6 max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>
        <PageHeader title="إدارة أوقات العمل" description="حدد أيام وساعات عملك"
          action={
            <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2 text-sm">
              <Save className="w-4 h-4" />{isSaving ? 'جارٍ الحفظ...' : 'حفظ الجدول'}
            </button>
          }
        />
        <ScheduleSlotManager schedule={schedule} onChange={handleChange} onToggle={handleToggle} />
      </div>
    </div>
  );
}
