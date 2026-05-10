// src/app/(admin)/appointments/new/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import Topbar from '@/components/layout/Topbar';
import { LoadingSpinner, Select } from '@/components/shared';
import { ArrowRight, CalendarDays, Clock, User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient, Doctor } from '@/types';

type Step = 'patient' | 'doctor' | 'datetime' | 'confirm';

export default function NewAppointmentPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Selections
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('REGULAR');

  // Filters
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getUsers({ role: 'PATIENT', limit: 200 }),
      doctorsService.search(),
    ])
    .then(([pRes, docs]: [any, Doctor[]]) => {
    setPatients(pRes.data ?? []);
    setDoctors(docs.filter((d) => d.isActive));
    })
      .catch(() => toast.error('فشل تحميل البيانات'));
  }, []);

  const loadSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setIsLoadingSlots(true);
    setSlots([]);
    setSelectedSlot('');
    try {
      const data = await appointmentsService.getSlots(selectedDoctor.id, selectedDate, selectedDoctor.branchId);
      // getSlots returns TimeSlot[] but backend may return string[]
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
      toast.error(err?.response?.data?.error || 'فشل حجز الموعد');
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
    { key: 'patient', label: 'اختر المريض', icon: User },
    { key: 'doctor', label: 'اختر الطبيب', icon: Stethoscope },
    { key: 'datetime', label: 'التاريخ والوقت', icon: CalendarDays },
    { key: 'confirm', label: 'تأكيد', icon: CheckCircle2 },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="موعد جديد" />

      <div className="p-6 max-w-2xl space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-4 h-4" /> العودة
        </button>

        {/* Progress steps */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < stepIndex ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step: Select Patient */}
        {step === 'patient' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">اختر المريض</h2>
            <input
              type="search"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الجوال..."
              className="input-field w-full"
            />
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setStep('doctor'); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                    selectedPatient?.id === p.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {p.name?.[0] ?? 'م'}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400" dir="ltr">{p.phone}</p>
                  </div>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">لا يوجد مرضى مطابقون</p>
              )}
            </div>
          </div>
        )}

        {/* Step: Select Doctor */}
        {step === 'doctor' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">اختر الطبيب</h2>
            <input
              type="search"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="ابحث بالاسم أو التخصص..."
              className="input-field w-full"
            />
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filteredDoctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDoctor(d); setStep('datetime'); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                    selectedDoctor?.id === d.id
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {d.name?.[0] ?? 'د'}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.specialty}</p>
                  </div>
                  {d.consultationFee && (
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                      {d.consultationFee} ر.س
                    </span>
                  )}
                </button>
              ))}
              {filteredDoctors.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">لا يوجد أطباء مطابقون</p>
              )}
            </div>
            <button onClick={() => setStep('patient')} className="btn-secondary w-full text-sm">
              رجوع
            </button>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">اختر التاريخ والوقت</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">التاريخ</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">نوع الموعد</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="input-field bg-white w-full"
              >
                <option value="REGULAR">عادي</option>
                <option value="URGENT">عاجل</option>
                <option value="FOLLOW_UP">متابعة</option>
              </select>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> المواعيد المتاحة
                </label>
                {isLoadingSlots ? (
                  <LoadingSpinner size="sm" />
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">لا توجد مواعيد متاحة في هذا اليوم</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                          selectedSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        dir="ltr"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">سبب الزيارة (اختياري)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="اذكر سبب الزيارة..."
                className="input-field w-full resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('doctor')} className="btn-secondary flex-1 text-sm">رجوع</button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedDate || !selectedSlot}
                className="btn-primary flex-1 text-sm"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedPatient && selectedDoctor && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">تأكيد الموعد</h2>

            <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
              {[
                { label: 'المريض', value: selectedPatient.name, icon: User },
                { label: 'الطبيب', value: `${selectedDoctor.name} — ${selectedDoctor.specialty}`, icon: Stethoscope },
                { label: 'التاريخ', value: formatDate(selectedDate), icon: CalendarDays },
                { label: 'الوقت', value: selectedSlot, icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">{label}</p>
                    <p className="text-sm font-semibold text-blue-900">{value}</p>
                  </div>
                </div>
              ))}
              {reason && (
                <div className="text-xs text-blue-600 bg-blue-100 rounded-xl px-3 py-2">
                  سبب الزيارة: {reason}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('datetime')} className="btn-secondary flex-1 text-sm">رجوع</button>
              <button
                onClick={handleBook}
                disabled={isSubmitting}
                className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري الحجز...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> تأكيد الحجز</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}