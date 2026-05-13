'use client';

import { useEffect, useState, useRef } from 'react';
import Topbar from '@/components/layout/Topbar';
import { doctorsService } from '@/services/doctors.service';
import { appointmentsService } from '@/services/appointments.service';
import { 
  Search, Stethoscope, Calendar, Clock, 
  MapPin, Star, ShieldCheck, Sparkles, 
  ChevronLeft, X, Filter, Zap, ArrowRight,
  User, CheckCircle2, Loader2, Heart
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
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
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

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
    !search || 
    doctor.name?.toLowerCase().includes(search.toLowerCase()) || 
    doctor.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async (time: string) => {
    if (!selectedDoctor) return;
    setIsBooking(true);
    try {
      await appointmentsService.book({ doctorId: selectedDoctor.id, date, time, type: 'NEW_VISIT' });
      toast.success('تم تأكيد الموعد بنجاح');
      setSelectedDoctor(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'تعذر حجز الموعد';
      toast.error(msg);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="البحث والحجز الذكي" subtitle="اعثر على نخبة الأطباء واحجز موعدك فوراً" />
      
      <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
        
        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-4 border border-white shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن طبيب، تخصص، أو عيادة..."
              className="w-full bg-slate-50/50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-[1.8rem] pr-14 pl-6 py-4 text-sm font-black text-slate-700 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <button className="h-14 px-8 rounded-[1.8rem] bg-slate-900 text-white font-black text-sm flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <Filter className="w-4 h-4" />
            تصفية النتائج
          </button>
        </div>

        {/* Selected Doctor / Booking Panel (Modal-like overlay when active) */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                    <div className="w-full h-full rounded-[1.4rem] bg-slate-100 flex items-center justify-center text-blue-600 font-black text-4xl">
                      {selectedDoctor.name?.[0] ?? 'د'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-1">د. {selectedDoctor.name}</h2>
                    <p className="text-blue-100 font-bold text-sm mb-3">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-widest">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-widest">
                        15+ سنة خبرة
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Body */}
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-black text-slate-800">اختر تاريخ الزيارة</span>
                  </div>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-black text-slate-800">الفترات المتاحة</span>
                  </div>
                  
                  {isFetchingSlots ? (
                    <div className="flex items-center gap-3 text-slate-400 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-bold">جارِ استخراج الفترات المتاحة...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center">
                      <p className="text-xs font-bold text-slate-400">عذراً، لا توجد فترات متاحة في هذا اليوم. جرب اختيار تاريخ آخر.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleBook(slot)}
                          disabled={isBooking}
                          className="px-3 py-3 rounded-xl bg-slate-50 text-slate-700 text-xs font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                          dir="ltr"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">حجز مؤمن بنظام 2Y</span>
                  </div>
                  <button onClick={() => setSelectedDoctor(null)} className="text-xs font-black text-slate-400 hover:text-slate-600">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800">لا توجد نتائج بحث</h3>
            <p className="text-sm font-medium text-slate-400 mt-2">جرب البحث بكلمات أخرى أو تصفح كافة التخصصات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doctor) => (
              <div 
                key={doctor.id} 
                className="group relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                
                <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 p-1 shadow-inner ring-4 ring-slate-50/50">
                    <div className="w-full h-full rounded-[1.6rem] bg-white flex items-center justify-center text-blue-600 font-black text-3xl">
                      {doctor.name?.[0] ?? 'د'}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">د. {doctor.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{doctor.specialty}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full pt-2">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">التقييم</span>
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">الحالات</span>
                      <span className="text-xs font-black text-slate-700">1.2k+</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full py-4 rounded-2xl bg-[#115e6e] text-white font-black text-sm shadow-lg shadow-[#115e6e]/10 hover:bg-[#0d4753] hover:shadow-2xl transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    حجز موعد الآن
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-[-4px] transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Sparkle */}
        <div className="flex items-center justify-center gap-6 py-8">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تأكيد فوري للحجز</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">بيانات سرية وآمنة</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رعاية تتمحور حولك</span>
          </div>
        </div>

      </div>
    </div>
  );
}

