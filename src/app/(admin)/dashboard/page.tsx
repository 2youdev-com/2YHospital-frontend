'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import Topbar from '@/components/layout/Topbar';
import {
  Users, CalendarDays, Stethoscope, DollarSign,
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  XCircle, Plus, RefreshCw, ArrowUpRight,
  AlertCircle, ListOrdered, Eye, Activity, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { DashboardStats } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeekDay { day: string; date: string; مواعيد: number; مكتملة: number; ملغاة: number }
interface DoctorStatus {
  id: string; name: string; specialty: string;
  status: 'available' | 'busy' | 'off';
  next: string | null; appointmentsToday: number; completedToday: number;
}
interface RecentAppt {
  id: string; refNum: string; patient: string; mrn: string;
  doctor: string; specialty: string; time: string; status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) =>
  n != null ? n.toLocaleString('ar-SA') : '—';
const fmtMoney = (n: number | null | undefined) =>
  n != null ? `${n.toLocaleString('ar-SA')} ر.س` : '—';
const growth = (n: number | null | undefined) => (n != null ? n : null);

const APPT_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  PENDING:     { label: 'انتظار',  cls: 'bg-amber-100/50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED:   { label: 'مؤكد',   cls: 'bg-blue-100/50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  COMPLETED:   { label: 'مكتمل',  cls: 'bg-emerald-100/50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'ملغي',   cls: 'bg-red-100/50 text-red-600 border border-red-200', dot: 'bg-red-500' },
  NO_SHOW:     { label: 'لم يحضر',cls: 'bg-slate-100/50 text-slate-600 border border-slate-200', dot: 'bg-slate-500' },
  RESCHEDULED: { label: 'مُعاد',  cls: 'bg-purple-100/50 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
};

const DOC_STATUS = {
  available: { label: 'متاح',     dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  busy:      { label: 'مشغول',    dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border border-amber-100' },
  off:       { label: 'غير متاح', dot: 'bg-slate-300',    badge: 'bg-slate-50 text-slate-500 border border-slate-200' },
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl p-4 text-right text-sm min-w-[160px]">
      <p className="font-bold text-slate-800 mb-3 border-b border-slate-50 pb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 mb-1.5" style={{ color: p.color }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: p.color }} />
          <span className="text-slate-600 font-medium">{p.name}:</span>
          <span className="font-black mr-auto">
            {p.name === 'إيرادات' ? `${Number(p.value).toLocaleString('ar-SA')} ر.س` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, sub, icon: Icon, theme, trend, href,
}: {
  title: string; value: string; sub?: string; icon: React.ElementType;
  theme: 'primary' | 'secondary' | 'light' | 'outline'; trend?: number | null; href?: string;
}) {
  const themes = {
    primary: 'bg-gradient-to-bl from-[#115e6e] to-[#0d4753] text-white shadow-lg shadow-[#115e6e]/20 border-none',
    secondary: 'bg-gradient-to-bl from-[#2bbcb3] to-[#20948d] text-white shadow-lg shadow-[#2bbcb3]/20 border-none',
    light: 'bg-white text-slate-800 shadow-sm border border-slate-100',
    outline: 'bg-transparent text-[#115e6e] border-2 border-[#115e6e]/20',
  };

  const isDark = theme === 'primary' || theme === 'secondary';

  const body = (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer ${themes[theme]}`}>
      {/* Decorative background shapes for dark themes */}
      {isDark && (
        <>
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150 duration-700" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-black/10 blur-2xl" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isDark ? 'bg-white/20 backdrop-blur-md' : 'bg-[#115e6e]/10'}`}>
            <Icon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#115e6e]'}`} />
          </div>
          {href && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 group-hover:bg-white/20' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
              <ArrowUpRight className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[#115e6e]'}`} />
            </div>
          )}
        </div>
        
        <p className={`${isDark ? 'text-white/80' : 'text-slate-500'} text-sm font-semibold mb-1`}>{title}</p>
        <p className={`text-3xl lg:text-4xl font-black tracking-tight tabular-nums leading-tight ${isDark ? 'text-white' : 'text-[#115e6e]'}`}>{value}</p>
        
        {sub && <p className={`${isDark ? 'text-white/60' : 'text-slate-400'} text-xs font-medium mt-2`}>{sub}</p>}
        
        {trend != null && (
          <div className={`inline-flex items-center gap-1.5 mt-4 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md ${
            trend >= 0 
              ? isDark ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
              : isDark ? 'bg-red-500/30 text-white' : 'bg-red-50 text-red-700'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span dir="ltr">{Math.abs(trend)}%</span>
            <span>{trend >= 0 ? 'نمو' : 'تراجع'}</span>
          </div>
        )}
      </div>
    </div>
  );
  return href ? <Link prefetch={false} href={href} className="block">{body}</Link> : body;
}

// ─── Mini stat ────────────────────────────────────────────────────────────────
function MiniStat({
  label, value, icon: Icon, colorClass,
}: { label: string; value: string; icon: React.ElementType; colorClass: 'amber' | 'emerald' | 'red' | 'purple' }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colors[colorClass]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-black text-[#115e6e] tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [weekData,     setWeekData]     = useState<WeekDay[]>([]);
  const [doctors,      setDoctors]      = useState<DoctorStatus[]>([]);
  const [recentAppts,  setRecentAppts]  = useState<RecentAppt[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const fetchLock = useRef(false);

  const loadAll = async (skipCache = false) => {
    const KEY = 'dashboard:v2';
    if (!skipCache) {
      const hit = getCached<{
        stats: DashboardStats; weekData: WeekDay[];
        doctors: DoctorStatus[]; recentAppts: RecentAppt[];
      }>(KEY, TTL.SHORT);
      if (hit) {
        setStats(hit.stats); setWeekData(hit.weekData);
        setDoctors(hit.doctors); setRecentAppts(hit.recentAppts);
        setLoadError(null);
        setIsLoading(false);
        return;
      }
    }
    try {
      const [statsResult, weekResult, doctorsResult, recentResult] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getWeeklyAppointments(),
        adminService.getDoctorsStatus(),
        adminService.getRecentAppointments(6),
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (weekResult.status === 'fulfilled') setWeekData(weekResult.value);
      if (doctorsResult.status === 'fulfilled') setDoctors(doctorsResult.value);
      if (recentResult.status === 'fulfilled') setRecentAppts(recentResult.value);

      if (statsResult.status === 'fulfilled') {
        const nextCache = {
          stats: statsResult.value,
          weekData: weekResult.status === 'fulfilled' ? weekResult.value : [],
          doctors: doctorsResult.status === 'fulfilled' ? doctorsResult.value : [],
          recentAppts: recentResult.status === 'fulfilled' ? recentResult.value : [],
        };
        setCached(KEY, nextCache);
      }

      if (statsResult.status === 'rejected') {
        setLoadError('تعذر تحميل الإحصائيات الرئيسية. يرجى التحقق من اتصال قاعدة البيانات.');
        toast.error('فشل تحميل الإحصائيات');
      } else if ([weekResult, doctorsResult, recentResult].some((r) => r.status === 'rejected')) {
        console.warn('Partial dashboard failure:', { weekResult, doctorsResult, recentResult });
        setLoadError(null);
      } else {
        setLoadError(null);
      }
    } catch {
      setLoadError('فشل الاتصال بالخادم. يرجى التحديث لاحقاً.');
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    if (fetchLock.current) return;
    fetchLock.current = true;
    loadAll(); 
  }, []);

  const todayStr = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Skeleton loader with matching rounded borders
  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="لوحة التحكم" />
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-[350px] rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="lg:col-span-2 h-[350px] rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-10">
      <Topbar title="لوحة التحكم الرئيسية" />

      <div className="px-6 md:px-8 py-6 space-y-8 max-w-7xl mx-auto">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight">نظرة عامة على النظام</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {todayStr}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsRefreshing(true); loadAll(true); }}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-sm font-bold bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl hover:bg-slate-50 hover:text-[#115e6e] transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </button>
            <Link
              href="/appointments/new"
              className="flex items-center gap-2 text-sm font-bold bg-[#115e6e] hover:bg-[#0d4753] text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-[#115e6e]/20"
            >
              <Plus className="w-4 h-4" />
              حجز موعد جديد
            </Link>
          </div>
        </div>

        {loadError && (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/80 backdrop-blur-md px-5 py-4 text-sm text-amber-800 shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="flex-1 font-medium">{loadError}</p>
            <button
              onClick={() => { setIsRefreshing(true); loadAll(true); }}
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="مواعيد اليوم"
            value={fmt(stats?.totalAppointmentsToday)}
            sub={`${fmt(stats?.completedToday)} مكتملة · ${fmt(stats?.confirmedToday)} مؤكدة`}
            icon={CalendarDays}
            theme="primary"
            trend={growth(stats?.appointmentGrowth)}
            href="/appointments"
          />
          <KpiCard
            title="إجمالي المرضى"
            value={fmt(stats?.totalPatients)}
            sub={`تم إضافة ${fmt(stats?.newPatientsThisMonth)} هذا الشهر`}
            icon={Users}
            theme="light"
            trend={growth(stats?.newPatientsGrowth)}
            href="/patients"
          />
          <KpiCard
            title="الأطباء النشطون"
            value={fmt(stats?.totalDoctors)}
            sub="الطاقم الطبي المتاح حالياً"
            icon={Stethoscope}
            theme="light"
            href="/doctors"
          />
          <KpiCard
            title="إيرادات الشهر"
            value={fmtMoney(stats?.totalRevenue)}
            sub={`الشهر السابق: ${fmtMoney(stats?.prevRevenue)}`}
            icon={DollarSign}
            theme="secondary"
            trend={growth(stats?.revenueGrowth)}
            href="/billing"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="مواعيد قيد الانتظار"   value={fmt(stats?.pendingAppointments)} icon={Clock}      colorClass="amber" />
          <MiniStat label="حالات مكتملة اليوم"    value={fmt(stats?.completedToday)}      icon={CheckCircle2} colorClass="emerald" />
          <MiniStat label="حالات ملغاة اليوم"     value={fmt(stats?.cancelledToday)}      icon={XCircle}      colorClass="red" />
          <MiniStat label="مرضى في قائمة الانتظار" value={fmt(stats?.waitlistCount)}       icon={ListOrdered}  colorClass="purple" />
        </div>

        {/* Alert: unpaid bills */}
        {(stats?.totalUnpaidBills ?? 0) > 0 && (
          <Link prefetch={false} href="/billing" className="flex items-center gap-4 bg-red-50/80 backdrop-blur-md border border-red-100 rounded-[1.5rem] px-6 py-4 hover:bg-red-50 transition-all shadow-sm group">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-red-800 font-bold flex-1">
              يوجد <span className="font-black text-red-600 text-lg mx-1">{fmt(stats?.totalUnpaidBills)}</span> فاتورة معلقة تتطلب المراجعة والتحصيل.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
              استعراض الفواتير <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}

        {/* Charts + Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly bar chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm p-6 lg:p-8">
            <div className="flex items-end justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#115e6e] flex items-center gap-2">
                  <HeartPulse className="w-5 h-5" />
                  حركة المواعيد
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1">تحليل لأداء العيادات خلال آخر 7 أيام</p>
              </div>
              <Link prefetch={false} href="/analytics" className="text-xs font-bold text-[#2bbcb3] hover:text-[#115e6e] bg-[#2bbcb3]/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
                التحليلات التفصيلية <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            {weekData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                <CalendarDays className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-bold">لا توجد بيانات متاحة للمواعيد</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weekData} barGap={4} barCategoryGap="25%" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTotal"  x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#115e6e" /><stop offset="100%" stopColor="#0d4753" />
                    </linearGradient>
                    <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2bbcb3" /><stop offset="100%" stopColor="#20948d" />
                    </linearGradient>
                    <linearGradient id="gCancel"   x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} tickMargin={12} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc', rx: 10 }} />
                  <Bar dataKey="مواعيد"  fill="url(#gTotal)"  radius={[6,6,0,0]} maxBarSize={32} />
                  <Bar dataKey="مكتملة" fill="url(#gDone)" radius={[6,6,0,0]} maxBarSize={32} />
                  <Bar dataKey="ملغاة"  fill="url(#gCancel)"   radius={[6,6,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#115e6e]" /><span className="text-xs font-bold text-slate-500">إجمالي المواعيد</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2bbcb3]" /><span className="text-xs font-bold text-slate-500">مكتملة بنجاح</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-xs font-bold text-slate-500">مواعيد ملغاة</span></div>
            </div>
          </div>

          {/* Doctors status */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-white/50">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#115e6e] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  حالة الطاقم الطبي
                </h3>
                <Link prefetch={false} href="/doctors" className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-[#115e6e] hover:bg-[#115e6e]/10 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {doctors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                  <Stethoscope className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-bold">لا يوجد أطباء متاحين</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doc) => {
                    const meta = DOC_STATUS[doc.status];
                    return (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-[1.2rem] bg-white border border-slate-100 hover:shadow-md hover:border-[#2bbcb3]/30 transition-all cursor-pointer group">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#115e6e]/5 text-[#115e6e] flex items-center justify-center text-sm font-black group-hover:bg-[#115e6e] group-hover:text-white transition-colors">
                            {doc.name[0]}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-white ${meta.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate leading-tight mb-0.5">{doc.name}</p>
                          <p className="text-xs font-medium text-slate-400">{doc.specialty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${meta.badge}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 tabular-nums bg-slate-50 px-2 py-0.5 rounded-lg">
                            {doc.completedToday}/{doc.appointmentsToday}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion rate trend & Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent appointments today */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
              <h3 className="text-base font-black text-[#115e6e] flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                سجل المواعيد القادمة
              </h3>
              <Link prefetch={false} href="/appointments" className="text-xs font-bold text-[#2bbcb3] hover:text-[#115e6e] transition-colors flex items-center gap-1">
                سجل المواعيد الكامل <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAppts.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-300">
                <CalendarDays className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-bold">لا توجد مواعيد مجدولة لهذا اليوم</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">الوقت</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400">المريض</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400">الطبيب المعالج</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400">الحالة</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentAppts.map((a) => {
                      const st = APPT_STATUS[a.status] ?? { label: a.status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-600 font-bold font-mono text-sm px-3 py-1 rounded-xl">
                              {a.time}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-800 mb-0.5">{a.patient}</p>
                            <p className="text-xs font-bold text-slate-400 font-mono">#{a.mrn}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#115e6e]">{a.doctor}</p>
                            <p className="text-[11px] font-bold text-slate-400">{a.specialty}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${st.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              <span className="text-xs font-bold">{st.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link prefetch={false} href={`/appointments/${a.id}`}
                              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-[#115e6e] hover:text-white hover:border-[#115e6e] transition-all shadow-sm opacity-0 group-hover:opacity-100">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Area Chart - Completion Rate */}
          {weekData.length > 0 && (
            <div className="bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2rem] shadow-lg shadow-[#115e6e]/20 p-6 flex flex-col text-white">
              <h3 className="text-base font-black mb-1">مؤشر كفاءة التشغيل</h3>
              <p className="text-xs font-medium text-white/60 mb-8">نسبة المواعيد المكتملة آخر 7 أيام</p>
              
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekData.map((d) => ({
                    day: d.day,
                    'الإتمام %': d.مواعيد > 0 ? Math.round((d.مكتملة / d.مواعيد) * 100) : 0,
                  }))}>
                    <defs>
                      <linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#ffffff" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#ffffff', opacity: 0.6 }} axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#ffffff', opacity: 0.6 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <Area type="monotone" dataKey="الإتمام %" stroke="#ffffff" strokeWidth={3}
                      fill="url(#gWhite)" dot={{ r: 4, fill: '#115e6e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#2bbcb3', stroke: '#fff', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
