'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, formatDate, getInitials } from '@/lib/utils';
import NotificationBell from '@/components/shared/NotificationBell';
import BrandMark from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { getRoleNavItems, isNavActive, roleLabels } from './role-navigation';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getRoleNavItems(user?.role);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-slate-950 sm:text-lg">{title}</h1>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              {subtitle ?? formatDate(new Date())}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            بحث سريع
          </div>
          <NotificationBell />
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 shadow-sm sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-teal-100 to-blue-100 text-xs font-black text-teal-700">
              {getInitials(user?.name)}
            </div>
            <div className="leading-tight">
              <p className="max-w-28 truncate text-xs font-semibold text-slate-950">{user?.name ?? '2YHospital'}</p>
              <p className="text-[10px] text-slate-500">{roleLabels[user?.role ?? 'ADMIN'] ?? 'فريق العمل'}</p>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden">
          <div className="flex h-full w-80 max-w-[86vw] flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <BrandMark />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {navItems.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn('sidebar-link', isNavActive(pathname, href, exact) && 'active')}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
