import { Badge } from '@/components/shared';
import { BILL_STATUS_COLORS, BILL_STATUS_LABELS } from '@/lib/constants';
import type { BillStatus } from '@/types';

export default function PaymentStatusBadge({ status }: { status: BillStatus }) {
  return (
    <Badge className={BILL_STATUS_COLORS[status]}>
      {BILL_STATUS_LABELS[status]}
    </Badge>
  );
}
