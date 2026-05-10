'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rescheduleSchema, type RescheduleInput } from '@/lib/validations';
import { appointmentsService } from '@/services/appointments.service';
import toast from 'react-hot-toast';
import { X, CalendarDays } from 'lucide-react';

interface RescheduleModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({ appointmentId, isOpen, onClose, onSuccess }: RescheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RescheduleInput>({
    resolver: zodResolver(rescheduleSchema),
  });

  const onSubmit = async (values: RescheduleInput) => {
    setIsSubmitting(true);
    try {
      await appointmentsService.reschedule(appointmentId, values.newDate, values.newTime);
      toast.success('تم إعادة جدولة الموعد بنجاح');
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'فشل إعادة الجدولة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">إعادة جدولة الموعد</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">التاريخ الجديد</label>
            <input
              type="date"
              {...register('newDate')}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
            {errors.newDate && <p className="text-xs text-red-500 mt-1">{errors.newDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الوقت الجديد</label>
            <input
              type="time"
              {...register('newTime')}
              className="input-field"
              dir="ltr"
            />
            {errors.newTime && <p className="text-xs text-red-500 mt-1">{errors.newTime.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">إلغاء</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'جارٍ الحفظ...' : 'تأكيد الجدولة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
