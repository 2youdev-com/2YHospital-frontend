import type { AppointmentStatus, BillStatus } from '@/types';

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  CANCELLED: 'ملغي',
  COMPLETED: 'مكتمل',
  NO_SHOW: 'لم يحضر',
  RESCHEDULED: 'أُعيدت جدولته',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-purple-100 text-purple-800',
};

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  UNPAID: 'غير مدفوع',
  PAID: 'مدفوع',
  PARTIALLY_PAID: 'مدفوع جزئياً',
  REFUNDED: 'مُسترد',
  WAIVED: 'معفو عنه',
};

export const BILL_STATUS_COLORS: Record<BillStatus, string> = {
  UNPAID: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  WAIVED: 'bg-gray-100 text-gray-800',
};

export const GENDER_LABELS = { MALE: 'ذكر', FEMALE: 'أنثى' };

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
  FINANCE: 'FINANCE',
} as const;