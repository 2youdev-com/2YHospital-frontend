'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { billingService } from '@/services/billing.service';
import Topbar from '@/components/layout/Topbar';
import { 
  Receipt, Eye, TrendingUp, AlertCircle, 
  CheckCircle2, Clock, Plus, Search, Filter,
  WalletCards, FileText, CalendarDays
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BILL_STATUS_LABELS } from '@/lib/constants';
import type { Bill, BillStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  ...Object.entries(BILL_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await billingService.getAllBills({ status: statusFilter || undefined, limit: 200 });
      setBills(res.data || []);
    } catch { }
    finally { setIsLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filtered = bills.filter(
    (b) => !search || b.patientName?.includes(search) || b.id.includes(search)
  );

  const paid = bills.filter(b => (b.status as string) === 'PAID').reduce((s, b) => s + b.amount, 0);
  const pending = bills.filter(b => (b.status as string) === 'PENDING').reduce((s, b) => s + b.amount, 0);
  const overdue = bills.filter(b => (b.status as string) === 'OVERDUE').reduce((s, b) => s + b.amount, 0);
  const partial = bills.filter(b => (b.status as string) === 'PARTIALLY_PAID').reduce((s, b) => s + b.amount, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', label: 'مدفوعة' };
      case 'PENDING': return { cls: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500', label: 'قيد الانتظار' };
      case 'OVERDUE': return { cls: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500', label: 'متأخرة' };
      case 'PARTIALLY_PAID': return { cls: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500', label: 'مدفوعة جزئياً' };
      case 'CANCELLED': return { cls: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'ملغاة' };
      default: return { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500', label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f4f7f8] min-h-screen">
        <Topbar title="إدارة الفواتير" />
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="h-32 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />)}
          </div>
          <div className="h-16 rounded-[1.5rem] bg-white/50 animate-pulse border border-slate-100" />
          <div className="h-96 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-10">
      <Topbar title="إدارة الشؤون المالية والفواتير" />
      
      <div className="px-6 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white shadow-sm flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] flex items-center justify-center shadow-lg shadow-[#115e6e]/20 text-white">
              <WalletCards className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#115e6e] tracking-tight mb-2">الفواتير والتحصيل</h1>
              <p className="text-sm font-medium text-slate-500">إدارة الإيرادات، المدفوعات، والفواتير المستحقة</p>
            </div>
          </div>
          
          <Link
            href="/billing/new"
            className="flex items-center justify-center gap-2 text-sm font-bold bg-[#115e6e] hover:bg-[#0d4753] text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#115e6e]/20"
          >
            <Plus className="w-4 h-4" />
            إنشاء فاتورة جديدة
          </Link>
        </div>

        {/* Financial Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-0.5">إجمالي المحصّل</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatCurrency(paid)}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-0.5">قيد الانتظار</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatCurrency(pending)}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-0.5">مبالغ متأخرة</p>
              <p className="text-xl font-black text-rose-600 tabular-nums">{formatCurrency(overdue)}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-0.5">تحصيل جزئي</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatCurrency(partial)}</p>
            </div>
          </div>
        </div>

        {/* Filters Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المريض أو رقم الفاتورة..."
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2bbcb3]/50 focus:border-[#2bbcb3] transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative md:w-64 w-full">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e6e]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#115e6e]/5 border border-[#115e6e]/10 text-[#115e6e] text-sm font-bold rounded-xl pr-9 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#115e6e]/30 cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
            <h2 className="text-base font-black text-[#115e6e] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              سجل الفواتير
            </h2>
            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              يعرض {filtered.length} فاتورة
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد فواتير</h3>
              <p className="text-sm font-medium text-slate-400">
                {search || statusFilter ? 'لا توجد نتائج مطابقة لبحثك، جرب إزالة الفلاتر.' : 'لم يتم إصدار أي فواتير بعد.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">رقم الفاتورة</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">المريض</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">المبلغ الإجمالي</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 hidden md:table-cell">المدفوع</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 hidden lg:table-cell">الاستحقاق</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400">الحالة</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 w-20">عرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((bill) => {
                    const statusStyle = getStatusStyle(bill.status as string);
                    
                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-bold text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-xl">
                            #{bill.id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-800 text-sm group-hover:text-[#115e6e] transition-colors">{bill.patientName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-[#115e6e] text-lg tabular-nums leading-none">
                            {formatCurrency(bill.amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm font-bold text-emerald-600 tabular-nums">
                            {bill.paidAmount ? formatCurrency(bill.paidAmount) : '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(bill.dueDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${statusStyle.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link prefetch={false} href={`/billing/${bill.id}`}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-[#115e6e] hover:text-white hover:border-[#115e6e] transition-all shadow-sm"
                            title="عرض الفاتورة"
                          >
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
      </div>
    </div>
  );
}
