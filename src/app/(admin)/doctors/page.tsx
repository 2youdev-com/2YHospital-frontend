'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doctorsService } from '@/services/doctors.service';
import { LoadingSpinner, SearchBar, EmptyState, Badge, Select } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { Stethoscope, Plus, Eye, Phone, Calendar, Star, Users } from 'lucide-react';
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
  const specOptions = [
    { value: '', label: 'كل التخصصات' },
    ...specialties.map(s => ({ value: s.nameAr, label: s.nameAr })),
  ];
  const statusOptions = [
    { value: '', label: 'كل الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
  ];

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="الأطباء" />
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">إدارة الأطباء</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {doctors.length} طبيب مسجل · <span className="text-emerald-600 font-medium">{activeCount} نشط</span>
            </p>
          </div>
          <Link
            href="/doctors/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> إضافة طبيب
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-52">
            <SearchBar value={search} onChange={setSearch} placeholder="بحث بالاسم أو التخصص..." />
          </div>
          <Select value={specialtyFilter} onChange={setSpecialtyFilter} options={specOptions} className="w-44" />
          <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} className="w-36" />
        </div>

        {/* Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="لا يوجد أطباء" description="جرب تغيير الفلاتر" icon={Stethoscope} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">

                {/* Top: avatar + name + status */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                    {doc.name.split(' ').find(w => w !== 'د.' && w !== 'دكتور' && w !== 'دكتورة')?.[0] ?? doc.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 leading-tight">{doc.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${doc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {doc.isActive ? '● نشط' : '○ غير نشط'}
                      </span>
                    </div>
                    <p className="text-sm text-teal-600 font-medium mt-0.5">{doc.specialty}</p>
                    {doc.branch && <p className="text-xs text-gray-400 mt-0.5">{doc.branch}</p>}
                  </div>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 flex-wrap">
                  {doc.phone && (
                    <span className="flex items-center gap-1" dir="ltr">
                      <Phone className="w-3 h-3" />{doc.phone}
                    </span>
                  )}
                  {doc.consultationFee !== undefined && (
                    <span className="flex items-center gap-1 text-gray-600 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                      {formatCurrency(doc.consultationFee)}
                    </span>
                  )}
                  {doc.stats?.rating !== undefined && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {doc.stats.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {doc.stats && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{doc.stats.totalAppointments}</p>
                      <p className="text-[10px] text-gray-400">الكل</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className="text-sm font-bold text-emerald-600">{doc.stats.completedAppointments}</p>
                      <p className="text-[10px] text-gray-400">مكتملة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-red-500">{doc.stats.cancelledAppointments}</p>
                      <p className="text-[10px] text-gray-400">ملغية</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/doctors/${doc.id}/schedule`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 py-2 rounded-xl transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" /> الجدول
                  </Link>
                  <Link
                    href={`/doctors/${doc.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> الملف
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
