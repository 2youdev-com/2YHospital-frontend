'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPatientSchema, type CreatePatientInput } from '@/lib/validations';
import { 
  User, Phone, Calendar, 
  Dna, Fingerprint, Sparkles, Info
} from 'lucide-react';

interface PatientFormProps {
  onSubmit: (data: CreatePatientInput) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function PatientForm({
  onSubmit,
  isSubmitting,
  onCancel,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      gender: 'MALE',
      dateOfBirth: '1990-01-01',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Basic Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">المعلومات الشخصية</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">الاسم الكامل *</label>
            <input {...register('nameAr')} className="input-field" placeholder="مثال: أحمد محمد علي" />
            {errors.nameAr && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.nameAr.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">رقم الهاتف *</label>
            <input {...register('phone')} className="input-field" placeholder="01XXXXXXXXX" dir="ltr" />
            {errors.phone && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">الهوية والميلاد</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">رقم الهوية / الإقامة</label>
            <input {...register('nationalId')} className="input-field" placeholder="1XXXXXXXXX" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">تاريخ الميلاد *</label>
            <input {...register('dateOfBirth')} type="date" className="input-field" />
            {errors.dateOfBirth && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">الجنس *</label>
            <select {...register('gender')} className="input-field bg-white appearance-none">
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <Dna className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">معلومات إضافية</h3>
        </div>

        <div className="max-w-xs space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">فصيلة الدم</label>
          <select {...register('bloodType')} className="input-field bg-white appearance-none">
            <option value="">غير محدد</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-[1.5rem] p-4 flex items-start gap-4">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-amber-600 leading-relaxed">
          تأكد من صحة رقم الهاتف، حيث سيتم استخدامه لإرسال رموز التحقق وإشعارات المواعيد. 
          رقم الملف الطبي (MRN) سيتم توليده تلقائياً.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
        <button type="button" onClick={onCancel} className="btn-secondary">إلغاء العملية</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 px-8">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جارٍ الحفظ...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> تسجيل المريض</>
          )}
        </button>
      </div>
    </form>
  );
}
