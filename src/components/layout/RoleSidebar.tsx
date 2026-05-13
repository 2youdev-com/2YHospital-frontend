'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import BrandMark from '@/components/brand/BrandMark';
import { getRoleNavItems, isNavActive, roleLabels, type NavItem } from './role-navigation';

interface RoleSidebarProps {
  role?: string;
  title: string;
  items?: NavItem[];
}

export default function RoleSidebar({ role, title, items }: RoleSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const visibleItems = items ?? getRoleNavItems(role ?? user?.role);

  return (
    <aside className="hidden h-screen w-72 flex-shrink-0 flex-col border-l border-slate-200/80 bg-white/90 backdrop-blur-xl lg:flex">
      <div className="px-5 py-5">
        <BrandMark />
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          {title}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {visibleItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn('sidebar-link', isNavActive(pathname, href, exact) && 'active')}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-100 to-blue-100 text-xs font-black text-teal-700">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{user?.name ?? '2YHospital'}</p>
            <p className="text-xs text-slate-500">{roleLabels[user?.role ?? role ?? 'ADMIN'] ?? 'فريق العمل'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
