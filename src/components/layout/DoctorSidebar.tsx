// src/components/layout/DoctorSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import { CalendarDays, Clock, Bot, LogOut, Hospital } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'جدول اليوم', icon: CalendarDays, exact: true },
  { href: '/portal/appointments', label: 'المواعيد', icon: Clock },
  { href: '/portal/schedule', label: 'إدارة الجدول', icon: CalendarDays },
  { href: '/portal/ai-assistant', label: 'المساعد الذكي', icon: Bot },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function DoctorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">2YHospital</p>
            <p className="text-xs text-gray-500">بوابة الطبيب</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-link', isActive(pathname, href, exact) && 'active')}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0">
            {getInitials(user?.name) || 'د'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'الطبيب'}</p>
            <p className="text-xs text-gray-500">طبيب</p>
          </div>
        </div>
        <button onClick={logout} className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}