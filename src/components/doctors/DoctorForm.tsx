'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDoctorSchema, type CreateDoctorInput } from '@/lib/validations';
import { doctorsService } from '@/services/doctors.service';
import { adminService } from '@/services/admin.service';
import { 
  User, Phone, Stethoscope, Building2, 
  DollarSign, FileText, Info, Sparkles 
} from 'lucide-react';
import type { Doctor, Specialty, Branch } from '@/types';

interface DoctorFormProps {
  defaultValues?: Partial<Doctor>;
  onSubmit: (data: CreateDoctorInput) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export default function DoctorForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel = 'حفظ البيانات',
}: DoctorFormProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      specialtyId: defaultValues?.specialtyId ?? '',
      branchId: defaultValues?.branchId ?? '',
      bio: defaultValues?.bio ?? '',
      consultationFee: defaultValues?.consultationFee,
    },
  });

  useEffect(() => {
    Promise.all([doctorsService.getSpecialties(), adminService.getBranches()])
      .then(([s, b]) => { setSpecialties(s); setBranches(b); })
      .catch(() => {});
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Section: Basic Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">المعلومات الأساسية</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">الاسم الكامل للطبيب *</label>
            <div className="relative">
              <input
                {...register('name')}
                className="input-field"
                placeholder="مثال: د. محمد العلي"
              />
            </div>
            {errors.name && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">رقم الجوال *</label>
            <input
              {...register('phone')}
              className="input-field"
              placeholder="05XXXXXXXX"
              dir="ltr"
            />
            {errors.phone && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Section: Professional Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">التخصص والعمل</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">التخصص الطبي *</label>
            <select {...register('specialtyId')} className="input-field bg-white appearance-none">
              <option value="">اختر التخصص من القائمة</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.nameAr}</option>
              ))}
            </select>
            {errors.specialtyId && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.specialtyId.message}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">الفرع / المنشأة</label>
            <select {...register('branchId')} className="input-field bg-white appearance-none">
              <option value="">اختر الفرع (اختياري)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.nameAr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">رسوم الاستشارة (ريال)</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              {...register('consultationFee')}
              type="number"
              min="0"
              className="input-field pr-10"
              placeholder="0.00"
            />
          </div>
          {errors.consultationFee && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.consultationFee.message}</p>}
        </div>
      </div>

      {/* Section: Bio */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#115e6e] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">السيرة المهنية</h3>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">نبذة مختصرة</label>
          <textarea
            {...register('bio')}
            className="input-field min-h-[120px] resize-none py-4"
            placeholder="اكتب هنا التخصصات الدقيقة، الخبرات السابقة، والمؤهلات العلمية..."
          />
          {errors.bio && <p className="text-[10px] font-bold text-rose-500 mr-2">{errors.bio.message}</p>}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-[1.5rem] p-4 flex items-start gap-4">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-800">ملاحظة هامة</p>
          <p className="text-[11px] font-bold text-amber-600 mt-0.5">يرجى التأكد من صحة رقم الجوال حيث سيتم استخدامه في إرسال التنبيهات وإدارة الدخول للنظام.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-secondary"
        >
          إلغاء العملية
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn-primary flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
