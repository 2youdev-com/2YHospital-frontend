// src/components/layout/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard, CalendarDays, Stethoscope, Users,
  Receipt, BarChart3, Bell, LogOut, Hospital, Bot,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/appointments', label: 'المواعيد', icon: CalendarDays },
  { href: '/doctors', label: 'الأطباء', icon: Stethoscope },
  { href: '/patients', label: 'المرضى', icon: Users },
  { href: '/billing', label: 'الفواتير', icon: Receipt },
  { href: '/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/ai-assistant', label: 'المساعد الذكي', icon: Bot },
];

const navByRole: Record<string, string[]> = {
  ADMIN: navItems.map((item) => item.href),
  RECEPTIONIST: ['/appointments', '/patients', '/doctors', '/notifications'],
  FINANCE: ['/billing', '/analytics', '/notifications'],
};

const roleLabels: Record<string, string> = {
  ADMIN: 'مدير النظام',
  RECEPTIONIST: 'استقبال',
  FINANCE: 'مالية',
};

// FIX: Use exact match for /dashboard to prevent it matching sub-paths,
// and use pathname === href || pathname.startsWith(href + '/') for others
// to avoid /patients matching /patients/[id] incorrectly or /d matching /dashboard.
function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const allowedNav = navByRole[user?.role ?? 'ADMIN'] ?? navByRole.ADMIN;
  const visibleItems = navItems.filter((item) => allowedNav.includes(item.href));

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">2YHospital</p>
            <p className="text-xs text-gray-500">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ href, label, icon: Icon, exact }) => (
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
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? 'المدير'}</p>
            <p className="text-xs text-gray-500">
              {roleLabels[user?.role ?? 'ADMIN'] ?? 'إدارة'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}