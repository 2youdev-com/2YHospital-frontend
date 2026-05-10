'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doctorsService } from '@/services/doctors.service';
import { PageHeader } from '@/components/shared';
import DoctorForm from '@/components/doctors/DoctorForm';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateDoctorInput } from '@/lib/validations';

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CreateDoctorInput) => {
    setIsSubmitting(true);
    try {
      await doctorsService.createDoctor(values);
      toast.success('تم إضافة الطبيب بنجاح');
      router.push('/doctors');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'فشل إضافة الطبيب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="إضافة طبيب" />
      <div className="p-6 max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>
        <PageHeader title="إضافة طبيب جديد" />
        <div className="card">
          <DoctorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} onCancel={() => router.back()} submitLabel="إضافة الطبيب" />
        </div>
      </div>
    </div>
  );
}
