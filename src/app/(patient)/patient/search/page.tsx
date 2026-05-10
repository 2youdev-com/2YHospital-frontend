'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Badge, EmptyState, LoadingSpinner, PageHeader, SearchBar } from '@/components/shared';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import { CalendarDays, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Doctor } from '@/types';

export default function PatientSearchPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    doctorsService.search()
      .then(setDoctors)
      .catch(() => toast.error('فشل تحميل قائمة الأطباء'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setIsFetchingSlots(true);
    appointmentsService.getSlots(selectedDoctor.id, date)
      .then((items) => setSlots(items.map((slot: any) => typeof slot === 'string' ? slot : slot.time).filter(Boolean)))
      .catch(() => setSlots([]))
      .finally(() => setIsFetchingSlots(false));
  }, [selectedDoctor, date]);

  const filtered = doctors.filter((doctor) =>
    !search || doctor.name?.includes(search) || doctor.specialty?.includes(search)
  );

  const handleBook = async (time: string) => {
    if (!selectedDoctor) return;
    setIsBooking(true);
    try {
      await appointmentsService.book({ doctorId: selectedDoctor.id, date, time, type: 'NEW_VISIT' });
      toast.success('تم تأكيد الموعد بنجاح');
      setSelectedDoctor(null);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      toast.error(data?.error || data?.message || 'تعذر حجز الموعد');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div>
      <Topbar title="البحث والحجز" />
      <div className="p-6">
        <PageHeader title="البحث عن طبيب أو تخصص" description="اختر الطبيب ثم التاريخ لعرض الفترات المتاحة" />
        <div className="mb-5">
          <SearchBar value={search} onChange={setSearch} placeholder="بحث باسم الطبيب أو التخصص..." />
        </div>

        {selectedDoctor && (
          <div className="card mb-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-semibold text-gray-900">حجز موعد مع {selectedDoctor.name}</h2>
                <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
              </div>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-44"
                dir="ltr"
              />
            </div>
            <div className="mt-4">
              {isFetchingSlots ? (
                <LoadingSpinner size="sm" />
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد فترات متاحة لهذا التاريخ.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleBook(slot)}
                      disabled={isBooking}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-mono hover:bg-blue-100 disabled:opacity-60"
                      dir="ltr"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="لا توجد نتائج" description="جرّب البحث باسم تخصص آخر أو طبيب مختلف" icon={Stethoscope} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((doctor) => (
              <button key={doctor.id} onClick={() => setSelectedDoctor(doctor)} className="card text-right hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{doctor.name}</p>
                    <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
                    <Badge className="bg-green-100 text-green-700 mt-2">متاح للحجز</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
