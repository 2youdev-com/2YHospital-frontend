import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Clock,
  FileText,
  Home,
  Receipt,
  Search,
  Stethoscope,
  UserCircle,
  Users,
  LayoutDashboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const adminNavItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/appointments', label: 'المواعيد', icon: CalendarDays },
  { href: '/doctors', label: 'الأطباء', icon: Stethoscope },
  { href: '/patients', label: 'المرضى', icon: Users },
  { href: '/billing', label: 'الفواتير', icon: Receipt },
  { href: '/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/ai-assistant', label: 'المساعد الذكي', icon: Bot },
];

export const doctorNavItems: NavItem[] = [
  { href: '/portal', label: 'جدول اليوم', icon: CalendarDays, exact: true },
  { href: '/portal/appointments', label: 'المواعيد', icon: Clock },
  { href: '/portal/schedule', label: 'إدارة الجدول', icon: CalendarDays },
  { href: '/portal/ai-assistant', label: 'المساعد الذكي', icon: Bot },
];

export const patientNavItems: NavItem[] = [
  { href: '/patient', label: 'الرئيسية', icon: Home, exact: true },
  { href: '/patient/search', label: 'البحث والحجز', icon: Search },
  { href: '/patient/appointments', label: 'مواعيدي', icon: CalendarDays },
  { href: '/patient/medical-records', label: 'ملفي الطبي', icon: FileText },
  { href: '/patient/billing', label: 'الفواتير', icon: Receipt },
  { href: '/patient/ai-assistant', label: 'المساعد الذكي', icon: Bot },
  { href: '/patient/profile', label: 'ملفي الشخصي', icon: UserCircle },
];

const navByRole: Record<string, NavItem[]> = {
  ADMIN: adminNavItems,
  RECEPTIONIST: adminNavItems.filter((item) => ['/appointments', '/patients', '/doctors', '/notifications'].includes(item.href)),
  FINANCE: adminNavItems.filter((item) => ['/billing', '/analytics', '/notifications'].includes(item.href)),
  DOCTOR: doctorNavItems,
  PATIENT: patientNavItems,
};

export function getRoleNavItems(role?: string): NavItem[] {
  return navByRole[role ?? 'ADMIN'] ?? adminNavItems;
}

export function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const roleLabels: Record<string, string> = {
  ADMIN: 'مدير النظام',
  RECEPTIONIST: 'استقبال',
  FINANCE: 'مالية',
  DOCTOR: 'طبيب',
  PATIENT: 'مريض',
};
