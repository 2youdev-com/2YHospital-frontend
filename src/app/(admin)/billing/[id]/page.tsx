'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { billingService } from '@/services/billing.service';
import { LoadingSpinner, Badge } from '@/components/shared';
import PaymentStatusBadge from '@/components/billing/PaymentStatusBadge';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Printer, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BILL_STATUS_COLORS, BILL_STATUS_LABELS } from '@/lib/constants';
import type { Bill, BillStatus } from '@/types';

export default function BillingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    billingService.getMyBill(id)
      .then(setBill)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Topbar title="تفاصيل الفاتورة" /><LoadingSpinner /></>;
  if (!bill) return <div className="p-6 text-gray-500">لم يتم العثور على الفاتورة</div>;

  const remaining = bill.amount - (bill.paidAmount ?? 0);

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="تفاصيل الفاتورة" />
      <div className="p-6 max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowRight className="w-4 h-4" /> العودة
          </button>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4" /> تنزيل PDF
            </button>
          </div>
        </div>

        {/* Invoice card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-l from-blue-700 to-blue-600 px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight">2YHospital</h2>
                <p className="text-blue-200 text-xs mt-0.5">فاتورة رسمية</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-blue-200">رقم الفاتورة</p>
                <p className="font-mono font-bold text-lg mt-0.5">#{bill.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Patient + Status */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">فاتورة باسم</p>
                <p className="text-lg font-bold text-gray-900">{bill.patientName}</p>
              </div>
              <PaymentStatusBadge status={bill.status as BillStatus} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">تاريخ الإنشاء</p>
                <p className="font-semibold text-gray-900">{formatDate(bill.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">تاريخ الاستحقاق</p>
                <p className="font-semibold text-gray-900">{formatDate(bill.dueDate)}</p>
              </div>
            </div>

            {/* Items table */}
            {bill.items && bill.items.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs">البيان</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">الكمية</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">سعر الوحدة</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bill.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-800">{item.description}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-left text-gray-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-left font-bold text-gray-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>المبلغ الإجمالي</span>
                <span className="font-semibold">{formatCurrency(bill.amount)}</span>
              </div>
              {(bill.paidAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>المدفوع</span>
                  <span className="font-semibold">- {formatCurrency(bill.paidAmount!)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                <span className="font-bold text-gray-900">المتبقي</span>
                <span className={`font-black text-lg ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
