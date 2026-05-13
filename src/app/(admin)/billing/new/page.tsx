'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBillSchema, type CreateBillInput } from '@/lib/validations';
import { billingService } from '@/services/billing.service';
import { adminService } from '@/services/admin.service';
import { appointmentsService } from '@/services/appointments.service';
import Topbar from '@/components/layout/Topbar';
import { PageHeader, LoadingSpinner } from '@/components/shared';
import { 
  ArrowRight, Plus, Trash2, Receipt, Calculator, 
  Calendar, User, CreditCard, Sparkles, AlertCircle,
  Info, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient, Appointment } from '@/types';

export default function NewBillPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const fetchLock = useRef(false);

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
    watchedItems.forEach((item, i) => {
      const total = Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0);
      setValue(`items.${i}.total`, total);
    });
    setValue('amount', calculatedTotal);
  }, [JSON.stringify(watchedItems)]);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

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

  if (isLoadingData) return (
    <div className="bg-[#f4f7f8] min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-sm font-bold text-slate-400">جاري تجهيز بيانات الفواتير...</p>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إصدار فاتورة جديدة" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> إلغاء والعودة للقائمة
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#115e6e]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl -ml-10 -mb-10" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold">
                <CreditCard className="w-4 h-4 text-teal-300" />
                النظام المالي الذكي
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">إصدار مطالبة مالية</h1>
              <p className="text-white/60 font-medium text-sm md:text-base max-w-xl">
                قم بإدخال بيانات المريض وتفصيل الخدمات الطبية المقدمة لاحتساب الإجمالي وإصدار الفاتورة.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section: Patient & Details */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#115e6e] flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-800">بيانات الفاتورة والارتباط</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> اختيار المريض *
                </label>
                <select
                  {...register('patientId')}
                  className="input-field bg-white appearance-none"
                >
                  <option value="">اختر المريض من القائمة</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? '—'} · {p.phone}
                    </option>
                  ))}
                </select>
                {errors.patientId && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.patientId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> ربط بموعد سابق
                </label>
                <select
                  {...register('appointmentId')}
                  disabled={!selectedPatientId}
                  className="input-field bg-white appearance-none disabled:opacity-50"
                >
                  <option value="">بدون موعد مرتبط</option>
                  {patientAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.date} · {a.time} · {a.doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="input-field"
                />
                {errors.dueDate && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.dueDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Items Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#115e6e] flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-800">بنود وتفاصيل الخدمات</h3>
              </div>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                className="flex items-center gap-2 text-xs font-black text-[#115e6e] bg-teal-50 px-4 py-2.5 rounded-xl hover:bg-teal-100 transition-all border border-teal-100"
              >
                <Plus className="w-4 h-4" /> إضافة بند جديد
              </button>
            </div>

            <div className="space-y-4">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-5">وصف الخدمة</div>
                <div className="col-span-2 text-center">الكمية</div>
                <div className="col-span-2 text-center">سعر الوحدة</div>
                <div className="col-span-2 text-center">الإجمالي</div>
                <div className="col-span-1" />
              </div>

              {/* Items */}
              <div className="space-y-3">
                {fields.map((field, i) => {
                  const qty = Number(watchedItems[i]?.quantity ?? 1);
                  const price = Number(watchedItems[i]?.unitPrice ?? 0);
                  const total = qty * price;

                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/40 border border-slate-50 p-4 rounded-2xl transition-all hover:bg-white group">
                      <div className="col-span-1 md:col-span-5">
                        <input
                          {...register(`items.${i}.description`)}
                          placeholder="مثال: كشفية عامة، فحص دم..."
                          className="input-field py-2.5 bg-transparent group-hover:bg-white"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <input
                          {...register(`items.${i}.quantity`)}
                          type="number"
                          min="1"
                          className="input-field py-2.5 text-center bg-transparent group-hover:bg-white"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <input
                          {...register(`items.${i}.unitPrice`)}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="input-field py-2.5 text-center bg-transparent group-hover:bg-white"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 text-center">
                        <span className="text-sm font-black text-slate-800 tabular-nums">{formatCurrency(total)}</span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Footer */}
              <div className="relative mt-8 overflow-hidden bg-[#115e6e] rounded-[2rem] p-8 text-white shadow-xl shadow-[#115e6e]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-teal-300 uppercase tracking-widest">إجمالي المبلغ المستحق</p>
                      <p className="text-sm font-medium text-white/60">شاملاً كافة البنود والخدمات المذكورة أعلاه</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black tabular-nums tracking-tighter">
                    {formatCurrency(calculatedTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 italic">
                بمجرد إصدار الفاتورة، سيتم إرسال تنبيه للمريض عبر حسابه الخاص مع إمكانية الدفع الإلكتروني.
              </p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 md:flex-none"
              >
                إلغاء العملية
              </button>
              <button
                type="submit"
                disabled={isSubmitting || calculatedTotal <= 0}
                className="btn-primary flex-[2] md:flex-none flex items-center justify-center gap-3 px-10"
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الحفظ...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> اعتماد وإصدار الفاتورة</>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>تم تطوير هذا النظام لخدمة 2YHospital بأعلى معايير الدقة والشفافية</span>
        </div>

      </div>
    </div>
  );
}
