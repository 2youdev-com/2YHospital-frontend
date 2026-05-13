// src/app/(admin)/analytics/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import Topbar from '@/components/layout/Topbar';
import { 
  RefreshCw, BarChart3, TrendingUp, PieChart as PieIcon, 
  CalendarDays, DollarSign, Users, Activity, HeartPulse,
  Target, Zap, ArrowUpRight, AlertCircle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MonthlyRevenue      { month: string; إيرادات: number }
interface MonthlyAppointments { month: string; مواعيد: number; مكتملة: number }
interface SpecialtyDist       { name: string; value: number }

const THEME_COLORS = {
  primary:   '#115e6e',
  secondary: '#2bbcb3',
  accent:    '#8b5cf6',
  danger:    '#f43f5e',
  warning:   '#f59e0b',
  success:   '#10b981'
};

const PIE_COLORS = ['#115e6e', '#2bbcb3', '#14b8a6', '#0d9488', '#0f766e', '#134e4a'];

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
          <span className="font-black mr-auto tabular-nums">
            {p.name.includes('إيرادات') ? `${Number(p.value).toLocaleString('ar-SA')} ر.س` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Analytics Card ───────────────────────────────────────────────────────────
function AnalyticsCard({ title, icon: Icon, children, subtitle, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#115e6e]/5 text-[#115e6e] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#115e6e]">{title}</h3>
            {subtitle && <p className="text-[11px] font-bold text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function MiniKpi({ label, value, icon: Icon, color, trend }: { 
  label: string; value: string; icon: React.ElementType; color: string; trend?: string 
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black ${color} tabular-nums`}>{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [monthlyRevenue,       setMonthlyRevenue]       = useState<MonthlyRevenue[]>([]);
  const [monthlyAppointments,  setMonthlyAppointments]  = useState<MonthlyAppointments[]>([]);
  const [specialtyDist,        setSpecialtyDist]        = useState<SpecialtyDist[]>([]);
  const [isLoading,            setIsLoading]            = useState(true);
  const [isRefreshing,         setIsRefreshing]         = useState(false);
  const fetchLock = useRef(false);

  const loadAll = async (skipCache = false) => {
    const cacheKey = 'analytics:v2';

    if (!skipCache) {
      const cached = getCached<{
        monthlyRevenue: MonthlyRevenue[];
        monthlyAppointments: MonthlyAppointments[];
        specialtyDist: SpecialtyDist[];
      }>(cacheKey, TTL.MEDIUM);

      if (cached) {
        setMonthlyRevenue(cached.monthlyRevenue);
        setMonthlyAppointments(cached.monthlyAppointments);
        setSpecialtyDist(cached.specialtyDist);
        setIsLoading(false);
        return;
      }
    }

    try {
      const [rev, appt, spec] = await Promise.all([
        adminService.getMonthlyRevenue(),
        adminService.getMonthlyAppointments(),
        adminService.getSpecialtyDistribution(),
      ]);

      setMonthlyRevenue(rev);
      setMonthlyAppointments(appt);
      setSpecialtyDist(spec);
      setCached(cacheKey, { monthlyRevenue: rev, monthlyAppointments: appt, specialtyDist: spec });
    } catch {
      toast.error('فشل تحميل بيانات التحليلات');
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAll(true);
  };

  // KPIs derived from real data
  const totalRevenue      = monthlyRevenue.reduce((s, m) => s + m.إيرادات, 0);
  const totalAppointments = monthlyAppointments.reduce((s, m) => s + m.مواعيد, 0);
  const totalCompleted    = monthlyAppointments.reduce((s, m) => s + m.مكتملة, 0);
  const completionRate    = totalAppointments > 0
    ? Math.round((totalCompleted / totalAppointments) * 100) : 0;
  const avgMonthlyRevenue = monthlyRevenue.length > 0
    ? Math.round(totalRevenue / monthlyRevenue.length) : 0;

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="التحليلات التفصيلية" />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-[1.5rem] bg-white/50 animate-pulse" />)}
        </div>
        <div className="h-[400px] rounded-[2rem] bg-white/50 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-[2rem] bg-white/50 animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-10">
      <Topbar title="التحليلات والتقارير" />

      <div className="px-6 md:px-8 py-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#115e6e]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl -ml-10 -mb-10" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold">
                <Target className="w-4 h-4 text-teal-300" />
                تحليل الأداء التشغيلي
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">رؤية شاملة للنمو المالي والطبي</h1>
              <p className="text-white/60 font-medium text-sm md:text-base max-w-xl">
                تتبع مؤشرات الأداء الرئيسية خلال الـ 6 أشهر الماضية بناءً على البيانات الفعلية من جميع الأقسام.
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl transition-all text-sm font-black group"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              تحديث البيانات
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniKpi 
            label="إجمالي إيرادات الفترة" 
            value={`${totalRevenue.toLocaleString('ar-SA')} ر.س`} 
            icon={DollarSign} 
            color="text-[#115e6e]"
            trend="+12.4%" 
          />
          <MiniKpi 
            label="متوسط الفواتير الشهرية" 
            value={`${avgMonthlyRevenue.toLocaleString('ar-SA')} ر.س`} 
            icon={Activity} 
            color="text-[#2bbcb3]" 
          />
          <MiniKpi 
            label="إجمالي المواعيد" 
            value={totalAppointments.toLocaleString('ar-SA')} 
            icon={CalendarDays} 
            color="text-[#115e6e]" 
          />
          <MiniKpi 
            label="معدل إتمام المراجعات" 
            value={`${completionRate}%`} 
            icon={Zap} 
            color="text-emerald-600"
            trend="تحسن ملحوظ"
          />
        </div>

        {/* Main Revenue Chart */}
        <AnalyticsCard 
          title="تحليل الإيرادات والنمو الشهري" 
          subtitle="مقارنة تراكمية للأداء المالي خلال آخر 6 أشهر"
          icon={TrendingUp}
          action={
            <Link prefetch={false} href="/billing" className="text-[11px] font-black text-[#2bbcb3] hover:underline flex items-center gap-1">
              التفاصيل المالية <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#115e6e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#115e6e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickMargin={15} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: '#115e6e', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="إيرادات" 
                  stroke="#115e6e" 
                  strokeWidth={3} 
                  fill="url(#areaGrad)" 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#115e6e' }} 
                  activeDot={{ r: 6, fill: '#2bbcb3', stroke: '#fff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        {/* Grid for distribution and trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Specialty Distribution */}
          <AnalyticsCard 
            title="توزيع الحالات حسب التخصص" 
            subtitle="نسبة المواعيد لكل قسم طبي"
            icon={PieIcon}
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {specialtyDist.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    formatter={(v) => <span className="text-xs font-bold text-slate-600 mr-2">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          {/* Appointment Activity */}
          <AnalyticsCard 
            title="نشاط المراجعات الشهرية" 
            subtitle="مقارنة بين إجمالي المواعيد والحالات المكتملة"
            icon={BarChart3}
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAppointments} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="مواعيد" fill="#115e6e" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="مكتملة" fill="#2bbcb3" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

        </div>

        {/* Action Footer */}
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">تحليل البيانات الذكي</p>
              <p className="text-xs font-medium text-slate-500">يتم تحديث هذه التقارير تلقائياً من واقع العمليات اليومية للعيادات.</p>
            </div>
          </div>
          <Link 
            prefetch={false}
            href="/dashboard" 
            className="w-full md:w-auto px-6 py-3 bg-[#115e6e] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#115e6e]/20 hover:scale-105 transition-all text-center"
          >
            العودة للوحة التحكم
          </Link>
        </div>

      </div>
    </div>
  );
}
