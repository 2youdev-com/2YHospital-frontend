'use client';

import Link from 'next/link';
import Topbar from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared';
import { Bot, CalendarDays, FileText, Receipt, Search } from 'lucide-react';

const actions = [
  { href: '/patient/search', label: 'حجز موعد', description: 'ابحث عن طبيب أو تخصص واختر موعدًا متاحًا', icon: Search },
  { href: '/patient/appointments', label: 'مواعيدي', description: 'راجع المواعيد القادمة وعدلها أو ألغها', icon: CalendarDays },
  { href: '/patient/medical-records', label: 'ملفي الطبي', description: 'نتائج المختبر، الأشعة، والوصفات', icon: FileText },
  { href: '/patient/billing', label: 'الفواتير', description: 'عرض حالة السداد وتفاصيل الفواتير', icon: Receipt },
  { href: '/patient/ai-assistant', label: 'المساعد الذكي', description: 'اسأل عن المواعيد أو النتائج بلغة مبسطة', icon: Bot },
];

export default function PatientHomePage() {
  return (
    <div>
      <Topbar title="الرئيسية" />
      <div className="p-6">
        <PageHeader
          title="أهلاً بك في 2YHospital"
          description="نقطة دخول موحدة لحجز المواعيد ومتابعة ملفك الصحي"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actions.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{label}</h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
