// src/app/(admin)/appointments/new/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import Topbar from '@/components/layout/Topbar';
import { LoadingSpinner, Select } from '@/components/shared';
import { 
  ArrowRight, CalendarDays, Clock, User, Stethoscope, 
  CheckCircle2, Search, ChevronLeft, MapPin, Activity,
  AlertCircle, ShieldCheck, Sparkles, UserPlus, FileText
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient, Doctor } from '@/types';

type Step = 'patient' | 'doctor' | 'datetime' | 'confirm';

export default function NewAppointmentPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchLock = useRef(false);

  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Selections
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('NEW_VISIT');

  // Filters
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    Promise.all([
      adminService.getUsers({ role: 'PATIENT', limit: 200 }),
      doctorsService.search(),
    ])
    .then(([pRes, docs]: [any, Doctor[]]) => {
      // pRes is directly the array from adminService.getUsers
      const rawItems = Array.isArray(pRes) ? pRes : (pRes.items || pRes.data || []);
      const items = rawItems.map((p: any) => ({
        ...p,
        id: p.patientId || p.id // Use patientId if available
      }));
      setPatients(items);
      setDoctors(docs.filter((d) => d.isActive));
    })
    .catch(() => toast.error('فشل تحميل البيانات'))
    .finally(() => setIsLoadingData(false));
  }, []);

  const loadSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setIsLoadingSlots(true);
    setSlots([]);
    setSelectedSlot('');
    try {
      const data = await appointmentsService.getSlots(selectedDoctor.id, selectedDate, selectedDoctor.branchId);
      const times = Array.isArray(data)
        ? data.map((s: any) => (typeof s === 'string' ? s : s.time))
        : [];
      setSlots(times);
    } catch {
      toast.error('فشل تحميل المواعيد المتاحة');
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (step === 'datetime') loadSlots();
  }, [step, loadSlots]);

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      await appointmentsService.book({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedSlot,
        branchId: selectedDoctor.branchId,
        reason: reason || undefined,
        type: appointmentType,
      });
      toast.success('تم حجز الموعد بنجاح');
      router.push('/appointments');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'فشل حجز الموعد';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    !patientSearch || p.name?.includes(patientSearch) || p.phone?.includes(patientSearch)
  );

  const filteredDoctors = doctors.filter((d) =>
    !doctorSearch || d.name?.includes(doctorSearch) || d.specialty?.includes(doctorSearch)
  );

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'patient', label: 'المريض', icon: User },
    { key: 'doctor', label: 'الطبيب', icon: Stethoscope },
    { key: 'datetime', label: 'الموعد', icon: CalendarDays },
    { key: 'confirm', label: 'التأكيد', icon: CheckCircle2 },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);
  const today = new Date().toISOString().split('T')[0];

  if (isLoadingData) return (
    <div className="bg-[#f4f7f8] min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-sm font-bold text-slate-400">جاري تجهيز بيانات الحجز...</p>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="حجز موعد جديد" />

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

        {/* Progress Steps (Premium Stepper) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-4" />
            
            {steps.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-lg",
                    done ? "bg-[#2bbcb3] text-white rotate-[360deg] shadow-[#2bbcb3]/20" : 
                    active ? "bg-[#115e6e] text-white scale-110 shadow-[#115e6e]/20" : 
                    "bg-white border border-slate-100 text-slate-300"
                  )}>
                    {done ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    active ? "text-[#115e6e]" : done ? "text-[#2bbcb3]" : "text-slate-400"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step: Select Patient */}
        {step === 'patient' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">اختيار المريض</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">ابحث عن المريض المسجل في النظام أو أضف مريضاً جديداً</p>
              </div>
              <Link prefetch={false} href="/patients" className="flex items-center gap-2 text-xs font-black text-[#115e6e] bg-slate-50 px-4 py-2.5 rounded-xl hover:bg-white transition-colors border border-slate-100">
                <UserPlus className="w-4 h-4" /> إضافة مريض
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="search"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="ابحث بالاسم، رقم الملف، أو رقم الجوال..."
                className="input-field pr-12"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setStep('doctor'); }}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#115e6e] hover:bg-[#115e6e]/5 transition-all text-right shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#115e6e] font-black text-lg flex items-center justify-center group-hover:bg-[#115e6e] group-hover:text-white transition-all">
                      {p.name?.[0] ?? 'م'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{p.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5" dir="ltr">{p.phone}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-200 group-hover:text-[#115e6e] group-hover:-translate-x-1 transition-all" />
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <div className="py-12 text-center">
                  <User className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400 italic">لا يوجد نتائج تطابق بحثك.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Select Doctor */}
        {step === 'doctor' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-black text-slate-800">اختيار الطبيب</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">حدد الطبيب المعالج والعيادة المختصة</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="search"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="ابحث باسم الطبيب أو التخصص..."
                className="input-field pr-12"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {filteredDoctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDoctor(d); setStep('datetime'); }}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#115e6e] hover:bg-[#115e6e]/5 transition-all text-right shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#115e6e] font-black text-lg flex items-center justify-center group-hover:bg-[#115e6e] group-hover:text-white transition-all">
                      {d.name?.[0] ?? 'د'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{d.name}</p>
                      <p className="text-[11px] font-bold text-[#2bbcb3] mt-0.5">{d.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {d.consultationFee && (
                      <span className="text-[10px] font-black text-[#115e6e] bg-slate-50 px-2 py-1 rounded-lg group-hover:bg-white transition-all">
                        {d.consultationFee} ر.س
                      </span>
                    )}
                    <ChevronLeft className="w-5 h-5 text-slate-200 group-hover:text-[#115e6e] group-hover:-translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
            
            <button onClick={() => setStep('patient')} className="btn-secondary w-full">
              الرجوع للخطوة السابقة
            </button>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-black text-slate-800">تحديد الموعد</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">اختر التاريخ والوقت المناسب لزيارة المريض</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5" /> التاريخ المفضل *
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> نوع الموعد
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="input-field bg-white appearance-none"
                >
                  <option value="NEW_VISIT">زيارة جديدة</option>
                  <option value="FOLLOW_UP">متابعة طبية</option>
                  <option value="CONSULTATION">استشارة</option>
                  <option value="EMERGENCY">حالة طارئة</option>
                </select>
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-4">
                <label className="text-[11px] font-black text-[#115e6e] mr-2 uppercase tracking-wider flex items-center gap-2 bg-teal-50/50 w-fit px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> الأوقات المتاحة لهذا الطبيب
                </label>
                
                {isLoadingSlots ? (
                  <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : slots.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                    <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">نأسف، لا توجد مواعيد متاحة في هذا اليوم.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "py-3 text-sm font-black rounded-xl border transition-all shadow-sm",
                          selectedSlot === slot
                            ? "bg-[#115e6e] text-white border-[#115e6e] shadow-lg shadow-[#115e6e]/20"
                            : "bg-white text-slate-600 border-slate-100 hover:border-[#2bbcb3] hover:text-[#2bbcb3]"
                        )}
                        dir="ltr"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> ملاحظات إضافية (اختياري)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="اكتب هنا سبب الزيارة أو أي ملاحظات للموظف..."
                className="input-field resize-none py-4"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-50">
              <button onClick={() => setStep('doctor')} className="btn-secondary flex-1">رجوع</button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedDate || !selectedSlot}
                className="btn-primary flex-1"
              >
                المراجعة والتأكيد
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedPatient && selectedDoctor && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#115e6e]/5 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-[#115e6e]" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">مراجعة بيانات الحجز</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">يرجى مراجعة البيانات قبل تأكيد العملية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'المريض', value: selectedPatient.name, icon: User, color: 'text-blue-600 bg-blue-50' },
                { label: 'الطبيب', value: selectedDoctor.name, icon: Stethoscope, color: 'text-teal-600 bg-teal-50' },
                { label: 'التخصص', value: selectedDoctor.specialty, icon: Activity, color: 'text-[#115e6e] bg-slate-50' },
                { label: 'التوقيت', value: `${formatDate(selectedDate)} - ${selectedSlot}`, icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-4 p-5 rounded-[1.8rem] bg-white border border-slate-50 shadow-sm transition-all hover:bg-slate-50/50">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-black text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={() => setStep('datetime')} className="btn-secondary flex-1">تعديل البيانات</button>
              <button
                onClick={handleBook}
                disabled={isSubmitting}
                className="btn-primary flex-[2] flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري تأكيد الحجز...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> تأكيد الحجز النهائي</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - دقة، خصوصية، وسرعة في الإنجاز</span>
        </div>

      </div>
    </div>
  );
}
