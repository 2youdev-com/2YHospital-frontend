'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDoctorSchema, type CreateDoctorInput } from '@/lib/validations';
import { doctorsService } from '@/services/doctors.service';
import { adminService } from '@/services/admin.service';
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
  submitLabel = 'حفظ',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="د. محمد العلي"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال *</label>
          <input
            {...register('phone')}
            className="input-field"
            placeholder="05XXXXXXXX"
            dir="ltr"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Specialty + Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">التخصص *</label>
          <select {...register('specialtyId')} className="input-field bg-white">
            <option value="">اختر التخصص</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.nameAr}</option>
            ))}
          </select>
          {errors.specialtyId && <p className="text-xs text-red-500 mt-1">{errors.specialtyId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الفرع</label>
          <select {...register('branchId')} className="input-field bg-white">
            <option value="">اختر الفرع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fee */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">رسوم الاستشارة (ريال)</label>
        <input
          {...register('consultationFee')}
          type="number"
          min="0"
          className="input-field"
          placeholder="150"
        />
        {errors.consultationFee && <p className="text-xs text-red-500 mt-1">{errors.consultationFee.message}</p>}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">نبذة عن الطبيب</label>
        <textarea
          {...register('bio')}
          className="input-field resize-none"
          rows={3}
          placeholder="تخصصات، خبرات، مؤهلات..."
        />
        {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          إلغاء
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'جارٍ الحفظ...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
