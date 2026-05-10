import { Badge } from '@/components/shared';
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import type { AppointmentStatus } from '@/types';

export default function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge className={APPOINTMENT_STATUS_COLORS[status]}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
