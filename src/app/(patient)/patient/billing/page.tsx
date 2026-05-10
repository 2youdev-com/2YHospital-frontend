'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Badge, EmptyState, LoadingSpinner, PageHeader } from '@/components/shared';
import { billingService } from '@/services/billing.service';
import { BILL_STATUS_COLORS, BILL_STATUS_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Bill, BillStatus } from '@/types';

export default function PatientBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchBills = () => {
    setIsLoading(true);
    billingService.getMyBills({ limit: 50 })
      .then((res) => setBills(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(fetchBills, []);

  const handlePay = async (bill: Bill) => {
    setPayingId(bill.id);
    try {
      await billingService.payBill(bill.id, 'ONLINE');
      toast.success('تم تحديث حالة السداد');
      fetchBills();
    } catch {
      toast.error('تعذر إتمام الدفع');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <Topbar title="الفواتير" />
      <div className="p-6">
        <PageHeader title="الفواتير والدفع" description="راجع حالة السداد وادفع الفواتير غير المسددة" />
        <div className="card p-0 overflow-hidden">
          {isLoading ? (
            <LoadingSpinner />
          ) : bills.length === 0 ? (
            <EmptyState title="لا توجد فواتير" icon={Receipt} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">الفاتورة</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">المبلغ</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ الاستحقاق</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{bill.id.slice(-8)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(bill.amount)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(bill.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Badge className={BILL_STATUS_COLORS[bill.status as BillStatus]}>
                          {BILL_STATUS_LABELS[bill.status as BillStatus]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-left">
                        {bill.status !== 'PAID' && (
                          <button
                            onClick={() => handlePay(bill)}
                            disabled={payingId === bill.id}
                            className="btn-primary text-xs"
                          >
                            {payingId === bill.id ? 'جارٍ الدفع...' : 'دفع الآن'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
