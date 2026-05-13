'use client';

import { useEffect, useState, useRef } from 'react';
import Topbar from '@/components/layout/Topbar';
import { billingService } from '@/services/billing.service';
import { BILL_STATUS_COLORS, BILL_STATUS_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Receipt, CreditCard, Download, ExternalLink, 
  ShieldCheck, Sparkles, Zap, ArrowUpRight, 
  Clock, CheckCircle2, AlertCircle, Loader2,
  Wallet, TrendingUp, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Bill, BillStatus } from '@/types';

export default function PatientBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const fetchLock = useRef(false);

  const fetchBills = (skipLock = false) => {
    if (!skipLock && fetchLock.current) return;
    fetchLock.current = true;
    
    setIsLoading(true);
    billingService.getMyBills({ limit: 50 })
      .then((res) => setBills(res.data ?? []))
      .catch(() => toast.error('تعذر تحميل بيانات الفواتير'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => fetchBills(), []);

  const handlePay = async (bill: Bill) => {
    setPayingId(bill.id);
    try {
      await billingService.payBill(bill.id, 'ONLINE');
      toast.success('تم إتمام الدفع بنجاح');
      fetchBills(true);
    } catch {
      toast.error('تعذر إتمام عملية الدفع');
    } finally {
      setPayingId(null);
    }
  };

  const totalDue = bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + b.amount, 0);
  const paidCount = bills.filter(b => b.status === 'PAID').length;

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="الفواتير والمدفوعات" />
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-[2rem] bg-white/50 animate-pulse border border-slate-100" />)}
        </div>
        <div className="h-96 rounded-[2.5rem] bg-white/50 animate-pulse border border-slate-100" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="المركز المالي للمريض" subtitle="إدارة المدفوعات والفواتير السريرية" />
      
      <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المستحقات</p>
            </div>
            <p className="text-3xl font-black text-slate-800">{formatCurrency(totalDue)}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فواتير مسددة</p>
            </div>
            <p className="text-3xl font-black text-slate-800">{paidCount} <span className="text-sm font-bold text-slate-400">فاتورة</span></p>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">المعاملات المؤمنة</p>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-sm font-black">2Y-Pay Gateway</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              تاريخ الفواتير
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400">تحميل الكل</span>
              <Download className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Receipt className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800">لا توجد فواتير حالياً</h3>
              <p className="text-sm font-medium text-slate-400 mt-2">كافة معاملاتك المالية ستظهر هنا بمجرد صدورها.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bills.map((bill) => (
                <div key={bill.id} className="group bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <Receipt className="w-8 h-8" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-widest font-mono">#{bill.id.slice(-8).toUpperCase()}</span>
                        <h4 className="text-lg font-black text-slate-800">فاتورة خدمات سريرية</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span className="text-xs font-bold text-slate-500">الاستحقاق: {formatDate(bill.dueDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-300" />
                          <span className="text-xs font-bold text-slate-500">المبلغ: {formatCurrency(bill.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                        bill.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        bill.status === 'OVERDUE' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {BILL_STATUS_LABELS[bill.status as BillStatus]}
                      </div>

                      {bill.status !== 'PAID' ? (
                        <button
                          onClick={() => handlePay(bill)}
                          disabled={payingId === bill.id}
                          className="flex items-center gap-3 bg-blue-600 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          {payingId === bill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          دفع الآن
                        </button>
                      ) : (
                        <button className="flex items-center gap-3 text-[#115e6e] font-black text-xs px-6 py-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                          <Download className="w-4 h-4" />
                          تحميل
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Sparkle */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-black text-slate-300 uppercase tracking-widest pt-8 border-t border-slate-100">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>نظام 2Y-Pay - معاملات مالية شفافة وآمنة</span>
        </div>

      </div>
    </div>
  );
}

