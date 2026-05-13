'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doctorsService } from '@/services/doctors.service';
import Topbar from '@/components/layout/Topbar';
import { 
  Stethoscope, Plus, Eye, Phone, Calendar, 
  Star, Users, Search, Filter, Activity, ArrowUpRight,
  ShieldCheck, AlertCircle, DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Doctor, Specialty } from '@/types';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([doctorsService.search(), doctorsService.getSpecialties()])
      .then(([docs, specs]) => { setDoctors(docs); setSpecialties(specs); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = doctors.filter((d) => {
    if (search && !d.name.includes(search) && !d.specialty.includes(search)) return false;
    if (specialtyFilter && d.specialty !== specialtyFilter) return false;
    if (statusFilter === 'active' && !d.isActive) return false;
    if (statusFilter === 'inactive' && d.isActive) return false;
    return true;
  });

  const activeCount = doctors.filter(d => d.isActive).length;

  if (isLoading) {
    return (
      <div className="bg-[#f4f7f8] min-h-screen">
        <Topbar title="إدارة الأطباء" />
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="h-24 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="h-16 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-10">
      <Topbar title="إدارة الأطباء" />
      
      <div className="px-6 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight">الطاقم الطبي</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  إجمالي: {doctors.length}
                </p>
                <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  نشط: {activeCount}
                </p>
              </div>
            </div>
          </div>
          
          <Link
            href="/doctors/new"
            className="flex items-center justify-center gap-2 text-sm font-bold bg-[#115e6e] hover:bg-[#0d4753] text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#115e6e]/20"
          >
            <Plus className="w-4 h-4" />
            إضافة طبيب جديد
          </Link>
        </div>

        {/* Filters Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطبيب أو التخصص..."
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2bbcb3]/50 focus:border-[#2bbcb3] transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-4 md:w-auto w-full">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e6e]" />
              <select 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full appearance-none bg-[#115e6e]/5 border border-[#115e6e]/10 text-[#115e6e] text-sm font-bold rounded-xl pr-9 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#115e6e]/30 cursor-pointer"
              >
                <option value="">كل التخصصات</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.nameAr}>{s.nameAr}</option>
                ))}
              </select>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-36 appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Grid Area */}
        {filtered.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-700 mb-1">لا يوجد أطباء مطابقين للبحث</h3>
            <p className="text-sm font-medium text-slate-400">جرب تغيير كلمات البحث أو مسح الفلاتر المختارة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <div key={doc.id} className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                
                {/* Doctor Header */}
                <div className="flex gap-4 mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#115e6e]/20 group-hover:scale-105 transition-transform">
                      {doc.name.split(' ').find(w => w !== 'د.' && w !== 'دكتور' && w !== 'دكتورة')?.[0] ?? doc.name[0]}
                    </div>
                    {doc.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm" title="نشط" />
                    )}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-[#115e6e] transition-colors">{doc.name}</h3>
                      {!doc.isActive && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#2bbcb3] mt-1">{doc.specialty}</p>
                    {doc.branch && <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1"><Activity className="w-3 h-3" /> {doc.branch}</p>}
                  </div>
                </div>

                {/* Info Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {doc.phone && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span dir="ltr">{doc.phone}</span>
                    </div>
                  )}
                  {doc.consultationFee !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#115e6e] bg-[#115e6e]/5 px-2.5 py-1.5 rounded-xl">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(doc.consultationFee)}
                    </div>
                  )}
                  {doc.stats?.rating !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-xl mr-auto">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {doc.stats.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                {doc.stats && (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-2xl mb-6 mt-auto">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">المواعيد</p>
                      <p className="text-base font-black text-slate-700">{doc.stats.totalAppointments}</p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <p className="text-[10px] font-bold text-emerald-600/70 mb-0.5">مكتملة</p>
                      <p className="text-base font-black text-emerald-600">{doc.stats.completedAppointments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-rose-500/70 mb-0.5">ملغاة</p>
                      <p className="text-base font-black text-rose-500">{doc.stats.cancelledAppointments}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link
                    href={`/doctors/${doc.id}/schedule`}
                    className="flex items-center justify-center gap-2 text-xs font-bold text-[#115e6e] bg-white border-2 border-[#115e6e]/10 hover:border-[#115e6e] hover:bg-[#115e6e]/5 py-2.5 rounded-xl transition-all"
                  >
                    <Calendar className="w-4 h-4" /> 
                    <span>جدول المواعيد</span>
                  </Link>
                  <Link
                    href={`/doctors/${doc.id}`}
                    className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#2bbcb3] hover:bg-[#20948d] shadow-lg shadow-[#2bbcb3]/20 py-2.5 rounded-xl transition-all"
                  >
                    <Eye className="w-4 h-4" /> 
                    <span>الملف الشخصي</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
