import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BILL_STATUS_COLORS, BILL_STATUS_LABELS } from '@/lib/constants';
import { Badge, EmptyState } from '@/components/shared';
import { Receipt, Eye } from 'lucide-react';
import type { Bill, BillStatus } from '@/types';

interface InvoiceTableProps {
  bills: Bill[];
  basePath?: string;
}

export default function InvoiceTable({ bills, basePath = '/billing' }: InvoiceTableProps) {
  if (bills.length === 0) {
    return <EmptyState title="لا توجد فواتير" icon={Receipt} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-right px-4 py-3 font-medium text-gray-600">رقم الفاتورة</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">المريض</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">المبلغ</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ الاستحقاق</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bills.map((bill) => (
            <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">#{bill.id.slice(-8)}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{bill.patientName}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(bill.amount)}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(bill.dueDate)}</td>
              <td className="px-4 py-3">
                <Badge className={BILL_STATUS_COLORS[bill.status as BillStatus]}>
                  {BILL_STATUS_LABELS[bill.status as BillStatus]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Link href={`${basePath}/${bill.id}`} className="text-blue-600 hover:text-blue-800 p-1 inline-flex">
                  <Eye className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
