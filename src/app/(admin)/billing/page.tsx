'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { billingService } from '@/services/billing.service';
import { LoadingSpinner, SearchBar, Select, EmptyState, Badge } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { Receipt, Eye, TrendingUp, AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BILL_STATUS_LABELS, BILL_STATUS_COLORS } from '@/lib/constants';
import type { Bill, BillStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  ...Object.entries(BILL_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium opacity-70">{label}</p>
        <p className="text-lg font-black mt-0.5">{value}</p>
      </div>
    </div>
  );
}

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

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="الفواتير" />
      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">إدارة الفواتير</h1>
            <p className="text-sm text-gray-500 mt-0.5">{bills.length} فاتورة إجمالاً</p>
          </div>
          <Link href="/billing/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-200">
            <Plus className="w-4 h-4" /> فاتورة جديدة
          </Link>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="إجمالي المحصّل" value={formatCurrency(paid)} icon={CheckCircle2} color="bg-emerald-50 border-emerald-100 text-emerald-800" />
          <SummaryCard label="قيد الانتظار" value={formatCurrency(pending)} icon={Clock} color="bg-amber-50 border-amber-100 text-amber-800" />
          <SummaryCard label="متأخرة" value={formatCurrency(overdue)} icon={AlertCircle} color="bg-red-50 border-red-100 text-red-800" />
          <SummaryCard label="مدفوع جزئياً" value={formatCurrency(partial)} icon={TrendingUp} color="bg-blue-50 border-blue-100 text-blue-800" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-52">
            <SearchBar value={search} onChange={setSearch} placeholder="بحث بالمريض أو رقم الفاتورة..." />
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="w-44" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState title="لا توجد فواتير" icon={Receipt} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">رقم الفاتورة</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">المريض</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">المبلغ الإجمالي</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">المدفوع</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">تاريخ الاستحقاق</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                    <th className="px-5 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((bill) => (
                    <tr key={bill.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">#{bill.id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{bill.patientName}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{formatCurrency(bill.amount)}</td>
                      <td className="px-5 py-4 hidden md:table-cell text-sm text-emerald-600 font-medium">
                        {bill.paidAmount ? formatCurrency(bill.paidAmount) : '—'}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-sm text-gray-500">{formatDate(bill.dueDate)}</td>
                      <td className="px-5 py-4">
                        <Badge className={BILL_STATUS_COLORS[bill.status as BillStatus]}>
                          {BILL_STATUS_LABELS[bill.status as BillStatus]}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/billing/${bill.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">عرض {filtered.length} من {bills.length} فاتورة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}