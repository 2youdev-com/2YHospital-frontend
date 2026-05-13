'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { billingService } from '@/services/billing.service';
import { LoadingSpinner, Badge } from '@/components/shared';
import PaymentStatusBadge from '@/components/billing/PaymentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Printer, Download, Receipt, 
  User, Calendar, ShieldCheck, Wallet,
  Sparkles, FileText, ArrowUpRight
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Bill, BillStatus } from '@/types';
import toast from 'react-hot-toast';

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="text-xs font-bold text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-700">{value}</span>
    </div>
  );
}

export default function BillingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    billingService.getMyBill(id)
      .then(setBill)
      .catch(() => toast.error('لم يتم العثور على الفاتورة'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الفاتورة" />
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/50 animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!bill) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="تفاصيل الفاتورة" />
      <div className="p-12 text-center text-slate-500 font-bold">لم يتم العثور على الفاتورة</div>
    </div>
  );

  const remaining = bill.amount - (bill.paidAmount ?? 0);

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="إدارة الفواتير" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة لسجل الفواتير
          </button>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button className="flex items-center gap-2 text-xs font-bold text-white bg-[#115e6e] px-4 py-2.5 rounded-xl hover:bg-[#0d4753] transition-all shadow-lg shadow-[#115e6e]/20">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Main Invoice Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar / Brief */}
          <div className="w-full md:w-80 bg-gradient-to-br from-[#115e6e] to-[#0d4753] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
                  <Receipt className="w-7 h-7 text-teal-300" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-1">بيانات التحصيل</h2>
                <p className="text-white/60 text-xs font-medium">رقم الفاتورة: #{bill.id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1.5">الحالة الحالية</p>
                  <PaymentStatusBadge status={bill.status as BillStatus} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1.5">تاريخ الاستحقاق</p>
                  <p className="font-bold text-sm">{formatDate(bill.dueDate)}</p>
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">المريض المستفيد</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm">
                    {bill.patientName[0]}
                  </div>
                  <p className="font-bold text-sm">{bill.patientName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 md:p-10 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-slate-800">تفاصيل الخدمات</h3>
              <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                تاريخ الإصدار: {formatDate(bill.createdAt)}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-100 rounded-[1.8rem] overflow-hidden">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">الخدمة / البيان</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider text-center">الكمية</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(bill.items && bill.items.length > 0) ? bill.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.description}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{item.quantity}</td>
                      <td className="px-6 py-4 text-left font-black text-slate-800 tabular-nums">{formatCurrency(item.total)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-700">رسوم كشف / استشارة طبية</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">1</td>
                      <td className="px-6 py-4 text-left font-black text-slate-800 tabular-nums">{formatCurrency(bill.amount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Wallet} label="المبلغ الإجمالي" value={formatCurrency(bill.amount)} />
                <InfoRow icon={ShieldCheck} label="المبلغ المدفوع" value={formatCurrency(bill.paidAmount ?? 0)} />
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-slate-900/10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المبلغ المتبقي للسداد</p>
                  <h4 className="text-3xl font-black tabular-nums">
                    {formatCurrency(remaining)}
                  </h4>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${remaining > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  <FileText className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* AI Suggestion / Note */}
            <div className="p-5 bg-teal-50/30 rounded-2xl border border-teal-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-teal-700 leading-relaxed">
                ملاحظة ذكية: المريض لديه سجل دفع ممتاز، يمكنك تقديم خصم 5% في الزيارة القادمة.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2YHospital - إدارة الفواتير والتحصيل الذكي</span>
        </div>

      </div>
    </div>
  );
}
