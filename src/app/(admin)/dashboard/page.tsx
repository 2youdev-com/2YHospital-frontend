'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { appointmentsService } from '@/services/appointments.service';
import { formatDate, formatCurrency } from '@/lib/utils';
import Topbar from '@/components/layout/Topbar';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import {
  CalendarDays, Users, Stethoscope, Receipt,
  Clock, XCircle, TrendingUp, TrendingDown,
  AlertTriangle, ArrowLeft, Activity, CheckCircle2,
  ChevronLeft, Zap, Bot,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell,
  BarChart, Bar,
} from 'recharts';
import type { DashboardStats, Appointment } from '@/types';

// ── Mock data ──────────────────────────────────────────────────────────────
const weekData = [
  { day: 'السبت',  مواعيد: 24, مكتملة: 20 },
  { day: 'الأحد',  مواعيد: 18, مكتملة: 14 },
  { day: 'الاثنين', مواعيد: 32, مكتملة: 29 },
  { day: 'الثلاثاء', مواعيد: 27, مكتملة: 24 },
  { day: 'الأربعاء', مواعيد: 35, مكتملة: 31 },
  { day: 'الخميس', مواعيد: 29, مكتملة: 25 },
  { day: 'الجمعة', مواعيد: 10, مكتملة: 9 },
];

const revenueData = [
  { month: 'يناير', إيرادات: 45000 },
  { month: 'فبراير', إيرادات: 52000 },
  { month: 'مارس', إيرادات: 48000 },
  { month: 'أبريل', إيرادات: 61000 },
  { month: 'مايو', إيرادات: 55000 },
  { month: 'يونيو', إيرادات: 67000 },
];

const specialtyData = [
  { name: 'باطنة', value: 35, fill: '#2563eb' },
  { name: 'عظام',  value: 20, fill: '#0f766e' },
  { name: 'أطفال', value: 18, fill: '#d97706' },
  { name: 'جلدية', value: 15, fill: '#7c3aed' },
];

const URGENCY_ALERTS = [
  { id: 1, msg: 'الدكتور أحمد لديه 3 مواعيد متأخرة', level: 'high' },
  { id: 2, msg: 'تجديد رخصة مزاولة المهنة خلال 7 أيام', level: 'medium' },
  { id: 3, msg: 'فاتورة عائلة الزهراني معلقة منذ 14 يوم', level: 'medium' },
];

// ── Tiny helpers ────────────────────────────────────────────────────────────
function TrendBadge({ value, label }: { value: number; label: string }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}٪ {label}
    </span>
  );
}

function KpiCard({
  title, value, icon: Icon, color, trend, subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <TrendBadge value={trend.value} label={trend.label} />}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Live Appointment Queue Item ─────────────────────────────────────────────
function QueueItem({ appt, index }: { appt: Appointment; index: number }) {
  const isNext = index === 0;
  const isNow  = appt.status === 'CONFIRMED' && index < 2;
  return (
    <Link href={`/appointments/${appt.id}`}>
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
        ${isNext ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
      >
        {/* Position indicator */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${isNext ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {index + 1}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {appt.patient?.name?.[0] ?? 'م'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{appt.patient?.name ?? 'مريض'}</p>
          <p className="text-xs text-gray-500 truncate">{appt.doctor.name}</p>
        </div>

        {/* Time + status */}
        <div className="text-left flex-shrink-0">
          <p className="text-xs font-mono font-medium text-gray-700" dir="ltr">{appt.time}</p>
          <AppointmentStatusBadge status={appt.status} />
        </div>
        <ChevronLeft className="w-4 h-4 text-gray-300 flex-shrink-0" />
      </div>
    </Link>
  );
}

// ── Radial progress for specialties ────────────────────────────────────────
function SpecialtyMini({ item, total }: { item: typeof specialtyData[0]; total: number }) {
  const pct = Math.round((item.value / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex-shrink-0">
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#f1f5f9" strokeWidth="4" />
          <circle
            cx="16" cy="16" r="12" fill="none"
            stroke={item.fill} strokeWidth="4"
            strokeDasharray={`${(pct / 100) * 75.4} 75.4`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">{item.name}</span>
          <span className="text-sm font-bold" style={{ color: item.fill }}>{pct}٪</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mt-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.fill }} />
        </div>
      </div>
    </div>
  );
}

// ── Doctor availability ─────────────────────────────────────────────────────
const MOCK_DOCTORS = [
  { name: 'د. محمد السالم', specialty: 'باطنة', status: 'available', next: '10:30' },
  { name: 'د. سارة العتيبي', specialty: 'أطفال', status: 'busy', next: '11:00' },
  { name: 'د. خالد الرشيد', specialty: 'عظام', status: 'available', next: '10:45' },
  { name: 'د. نورة الفهد', specialty: 'جلدية', status: 'break', next: '12:00' },
];

function DoctorStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { available: 'bg-emerald-500', busy: 'bg-red-500', break: 'bg-amber-400' };
  const labels: Record<string, string> = { available: 'متاح', busy: 'في موعد', break: 'استراحة' };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />
      <span className="text-xs text-gray-500">{labels[status]}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      appointmentsService.getAllAppointments({ limit: 8 }),
    ])
      .then(([s, appts]) => {
        setStats(s);
        setRecentAppointments(appts.data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const specTotal = specialtyData.reduce((a, b) => a + b.value, 0);

  // Skeleton loader
  if (isLoading) {
    return (
      <>
        <Topbar title="لوحة التحكم" />
        <div className="p-6 space-y-4 animate-pulse">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-72 bg-gray-100 rounded-2xl" />
            <div className="h-72 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="لوحة التحكم" />

      <div className="p-6 space-y-5">

        {/* ── ALERT BANNER ─────────────────────────────────────────────── */}
        {URGENCY_ALERTS.length > 0 && (
          <div className="bg-gradient-to-l from-amber-500 to-orange-500 rounded-2xl p-4 flex items-start gap-3 text-white">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1">تنبيهات تحتاج انتباهك</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {URGENCY_ALERTS.map((a) => (
                  <p key={a.id} className="text-xs text-orange-100 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.level === 'high' ? 'bg-white' : 'bg-orange-200'}`} />
                    {a.msg}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WELCOME HEADER ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(now, 'EEEE، dd MMMM yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ai-assistant" className="flex items-center gap-2 bg-gradient-to-l from-blue-600 to-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              <Bot className="w-4 h-4" />
              ملخص ذكي
            </Link>
            <Link href="/appointments/new" className="flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <CalendarDays className="w-4 h-4" />
              موعد جديد
            </Link>
          </div>
        </div>

        {/* ── KPI ROW 1: Operational ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="مواعيد اليوم"
            value={stats?.totalAppointmentsToday ?? 47}
            icon={CalendarDays}
            color="bg-blue-100 text-blue-600"
            trend={{ value: stats?.appointmentGrowth ?? 12, label: 'عن أمس' }}
            subtitle="من إجمالي الطاقة"
          />
          <KpiCard
            title="مواعيد معلقة"
            value={stats?.pendingAppointments ?? 8}
            icon={Clock}
            color="bg-amber-100 text-amber-600"
          />
          <KpiCard
            title="مكتملة اليوم"
            value={31}
            icon={CheckCircle2}
            color="bg-emerald-100 text-emerald-600"
            trend={{ value: 5, label: 'عن أمس' }}
          />
          <KpiCard
            title="إلغاءات اليوم"
            value={stats?.cancelledToday ?? 3}
            icon={XCircle}
            color="bg-red-100 text-red-500"
          />
        </div>

        {/* ── KPI ROW 2: Administrative ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="إجمالي الأطباء"
            value={stats?.totalDoctors ?? 18}
            icon={Stethoscope}
            color="bg-teal-100 text-teal-600"
            subtitle="12 نشط الآن"
          />
          <KpiCard
            title="إجمالي المرضى"
            value={stats?.totalPatients ?? 1240}
            icon={Users}
            color="bg-purple-100 text-purple-600"
            trend={{ value: 8, label: 'هذا الشهر' }}
          />
          <KpiCard
            title="إيرادات الشهر"
            value={formatCurrency(stats?.totalRevenue ?? 67000)}
            icon={Receipt}
            color="bg-green-100 text-green-600"
            trend={{ value: stats?.revenueGrowth ?? 18, label: 'عن الشهر السابق' }}
          />
          <KpiCard
            title="متوسط وقت الانتظار"
            value="14 دقيقة"
            icon={Activity}
            color="bg-orange-100 text-orange-600"
            trend={{ value: -3, label: 'تحسن' }}
          />
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* LEFT: Chart area (2/3) */}
          <div className="xl:col-span-2 space-y-5">

            {/* Appointments this week — Stacked area */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">المواعيد — آخر 7 أيام</h2>
                  <p className="text-xs text-gray-400 mt-0.5">إجمالي vs مكتملة</p>
                </div>
                <Link href="/analytics" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  تقرير كامل <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'var(--font-cairo)', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'var(--font-cairo)' }}
                  />
                  <Area type="monotone" dataKey="مواعيد" stroke="#2563eb" fill="url(#gTotal)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="مكتملة" stroke="#059669" fill="url(#gDone)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center gap-5 mt-2 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-blue-600 rounded inline-block" /> إجمالي المواعيد
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-emerald-600 rounded inline-block" /> مكتملة
                </span>
              </div>
            </div>

            {/* Revenue bar + specialty distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Revenue bar */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">الإيرادات</h2>
                <p className="text-xs text-gray-400 mb-3">آخر 6 أشهر</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: 'var(--font-cairo)', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontFamily: 'var(--font-cairo)', fontSize: '12px' }} />
                    <Bar dataKey="إيرادات" fill="#2563eb" radius={[4, 4, 0, 0]}>
                      {revenueData.map((_, i) => (
                        <Cell key={i} fill={i === revenueData.length - 1 ? '#2563eb' : '#bfdbfe'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Specialty distribution */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">توزيع التخصصات</h2>
                <p className="text-xs text-gray-400 mb-4">حسب عدد المواعيد</p>
                <div className="space-y-3.5">
                  {specialtyData.map((item) => (
                    <SpecialtyMini key={item.name} item={item} total={specTotal} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Queue + Doctors (1/3) */}
          <div className="space-y-5">

            {/* Live appointment queue */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">قائمة الانتظار</h2>
                </div>
                <Link href="/appointments" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                  الكل <ChevronLeft className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
                {recentAppointments.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">لا توجد مواعيد اليوم</p>
                ) : (
                  recentAppointments.slice(0, 6).map((appt, i) => (
                    <QueueItem key={appt.id} appt={appt} index={i} />
                  ))
                )}
              </div>
            </div>

            {/* Doctor availability */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">حالة الأطباء</h2>
                <Link href="/doctors" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                  الكل <ChevronLeft className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_DOCTORS.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {doc.name[2]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.specialty}</p>
                    </div>
                    <div className="text-left">
                      <DoctorStatusDot status={doc.status} />
                      <p className="text-xs text-gray-400 mt-0.5" dir="ltr">▷ {doc.next}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-blue-200" />
                <h2 className="text-sm font-semibold">إجراءات سريعة</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'موعد جديد',  href: '/appointments', icon: CalendarDays },
                  { label: 'إضافة طبيب', href: '/doctors/new',   icon: Stethoscope },
                  { label: 'فاتورة',     href: '/billing',       icon: Receipt },
                  { label: 'تحليلات',    href: '/analytics',     icon: Activity },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href}
                    className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-colors"
                  >
                    <Icon className="w-5 h-5 text-blue-200" />
                    <span className="text-xs font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}