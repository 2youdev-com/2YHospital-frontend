'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import PatientForm from '@/components/patients/PatientForm';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreatePatientInput } from '@/lib/validations';

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CreatePatientInput) => {
    setIsSubmitting(true);
    try {
      await adminService.createPatient(values);
      toast.success('تم تسجيل المريض بنجاح');
      router.push('/patients');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'فشل تسجيل المريض';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="تسجيل مريض جديد" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> إلغاء والعودة
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#115e6e]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold">
                <UserPlus className="w-4 h-4 text-teal-300" />
                تسجيل جديد
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">إضافة مريض جديد للنظام</h1>
              <p className="text-white/60 font-medium text-sm md:text-base max-w-xl">
                قم بفتح ملف طبي جديد للمريض لتسهيل عملية حجز المواعيد ومتابعة الفواتير والنتائج.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
          <PatientForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            onCancel={() => router.back()} 
          />
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - دقة، خصوصية، وسرعة في الإنجاز</span>
        </div>

      </div>
    </div>
  );
}
