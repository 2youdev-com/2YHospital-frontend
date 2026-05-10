import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────────────
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'رقم الجوال يجب أن يكون 10 أرقام على الأقل')
    .regex(/^05\d{8}$/, 'رقم الجوال غير صحيح (مثال: 05XXXXXXXX)'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يحتوي على أرقام فقط'),
});

// ─── Doctor ────────────────────────────────────────────────────────────────
export const createDoctorSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الجوال غير صحيح'),
  specialtyId: z.string().min(1, 'يرجى اختيار التخصص'),
  branchId: z.string().optional(),
  bio: z.string().max(500, 'النبذة لا تتجاوز 500 حرف').optional(),
  consultationFee: z.coerce.number().min(0, 'الرسوم يجب أن تكون 0 أو أكثر').optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

// ─── Appointment ───────────────────────────────────────────────────────────
export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'يرجى اختيار الطبيب'),
  date: z.string().min(1, 'يرجى اختيار التاريخ'),
  time: z.string().min(1, 'يرجى اختيار الوقت'),
  branchId: z.string().optional(),
  reason: z.string().max(300, 'السبب لا يتجاوز 300 حرف').optional(),
  type: z.string().optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

export const rescheduleSchema = z.object({
  newDate: z.string().min(1, 'يرجى اختيار التاريخ الجديد'),
  newTime: z.string().min(1, 'يرجى اختيار الوقت الجديد'),
  reason: z.string().optional(),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;

// ─── Branch ────────────────────────────────────────────────────────────────
export const branchSchema = z.object({
  nameAr: z.string().min(2, 'اسم الفرع يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type BranchInput = z.infer<typeof branchSchema>;

// ─── Bill ──────────────────────────────────────────────────────────────────
export const createBillSchema = z.object({
  patientId: z.string().min(1, 'يرجى اختيار المريض'),
  appointmentId: z.string().optional(),
  amount: z.coerce.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  dueDate: z.string().min(1, 'يرجى تحديد تاريخ الاستحقاق'),
  items: z.array(z.object({
    description: z.string().min(1, 'وصف البند مطلوب'),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
  })).optional(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;

// ─── Visit Notes ───────────────────────────────────────────────────────────
export const visitNotesSchema = z.object({
  note: z.string().min(10, 'الملاحظة يجب أن تكون 10 أحرف على الأقل').max(5000),
});

export type VisitNotesInput = z.infer<typeof visitNotesSchema>;
