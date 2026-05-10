'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBillSchema, type CreateBillInput } from '@/lib/validations';
import { billingService } from '@/services/billing.service';
import { adminService } from '@/services/admin.service';
import { appointmentsService } from '@/services/appointments.service';
import Topbar from '@/components/layout/Topbar';
import { PageHeader, LoadingSpinner } from '@/components/shared';
import { ArrowRight, Plus, Trash2, Receipt, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient, Appointment } from '@/types';

export default function NewBillPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateBillInput>({
    resolver: zodResolver(createBillSchema),
    defaultValues: {
      patientId: '',
      appointmentId: '',
      amount: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items') ?? [];

  // Auto-calc total from items
  const calculatedTotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unitPrice ?? 0);
    return sum + qty * price;
  }, 0);

  useEffect(() => {
    // Update item totals + overall amount
    watchedItems.forEach((item, i) => {
      const total = Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0);
      setValue(`items.${i}.total`, total);
    });
    setValue('amount', calculatedTotal);
  }, [JSON.stringify(watchedItems)]);

  useEffect(() => {
    Promise.all([
      adminService.getUsers({ role: 'PATIENT', limit: 200 }),
      appointmentsService.getAllAppointments({ limit: 100 }),
    ])
      .then(([pRes, aRes]) => {
        setPatients(pRes.data || []);
        setAppointments(aRes.data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoadingData(false));
  }, []);

  const selectedPatientId = watch('patientId');
  const patientAppointments = appointments.filter(a => a.patient?.id === selectedPatientId);

  const onSubmit = async (values: CreateBillInput) => {
    setIsSubmitting(true);
    try {
      await billingService.createBill({
        ...values,
        appointmentId: values.appointmentId || undefined,
      });
      toast.success('تم إنشاء الفاتورة بنجاح');
      router.push('/billing');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'فشل إنشاء الفاتورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <><Topbar title="فاتورة جديدة" /><LoadingSpinner /></>;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="فاتورة جديدة" />
      <div className="p-6 max-w-3xl space-y-5">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        <PageHeader
          title="إنشاء فاتورة جديدة"
          description="أدخل بيانات الفاتورة وبنودها"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Patient + Appointment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              بيانات الفاتورة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  المريض *
                </label>
                <select
                  {...register('patientId')}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-white"
                >
                  <option value="">اختر المريض</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? '—'} · {p.phone}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-xs text-red-500 mt-1">{errors.patientId.message}</p>
                )}
              </div>

              {/* Appointment (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  ربط بموعد (اختياري)
                </label>
                <select
                  {...register('appointmentId')}
                  disabled={!selectedPatientId}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-white disabled:opacity-50"
                >
                  <option value="">بدون موعد</option>
                  {patientAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.date} · {a.time} · {a.doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bill items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-600" />
                بنود الفاتورة
              </h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة بند
              </button>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
              <div className="col-span-5">البيان</div>
              <div className="col-span-2 text-center">الكمية</div>
              <div className="col-span-2 text-center">السعر</div>
              <div className="col-span-2 text-center">المجموع</div>
              <div className="col-span-1" />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {fields.map((field, i) => {
                const qty = Number(watchedItems[i]?.quantity ?? 1);
                const price = Number(watchedItems[i]?.unitPrice ?? 0);
                const total = qty * price;

                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2">
                    <div className="col-span-5">
                      <input
                        {...register(`items.${i}.description`)}
                        placeholder="وصف الخدمة أو المنتج"
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        {...register(`items.${i}.quantity`)}
                        type="number"
                        min="1"
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors text-center bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        {...register(`items.${i}.unitPrice`)}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors text-center bg-white"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-gradient-to-l from-blue-600 to-blue-700 text-white rounded-2xl px-5 py-4 mt-2">
              <span className="font-semibold text-sm">الإجمالي</span>
              <span className="text-2xl font-black tabular-nums">{formatCurrency(calculatedTotal)}</span>
            </div>

            {/* Hidden amount field */}
            <input type="hidden" {...register('amount')} />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary px-6"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || calculatedTotal <= 0}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ الإنشاء...</>
              ) : (
                <><Receipt className="w-4 h-4" /> إنشاء الفاتورة</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}