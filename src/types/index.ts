// src/types/index.ts
// ─── Auth ───────────────────────────────────────────────────────────────
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST' | 'FINANCE';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── API Response ────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Doctor ──────────────────────────────────────────────────────────────
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyId?: string;
  branch?: string;
  branchId?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  consultationFee?: number;
  schedule?: ScheduleSlot[];
  stats?: DoctorStats;
}

export interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rating?: number;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
  startTime: string; // "09:00"
  endTime: string;
  slotDurationMinutes: number;
  isBlocked: boolean;
}

export interface Specialty {
  id: string;
  nameAr: string;
  nameEn?: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────
// FIX: Added RESCHEDULED status to match backend AppointmentStatus enum
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface Appointment {
  id: string;
  referenceNumber?: string;
  date: string;
  time: string;
  startTime?: string;
  status: AppointmentStatus;
  type?: string;
  reason?: string;
  notes?: string;
  doctor: Pick<Doctor, 'id' | 'name' | 'specialty'>;
  patient?: Pick<Patient, 'id' | 'name' | 'phone'>;
  branch?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ─── Patient ─────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  nationalId?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  isActive: boolean;
  mrn?: string;
}

// ─── Medical Records ──────────────────────────────────────────────────────
export interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'NORMAL' | 'ABNORMAL' | 'PENDING';
  results?: LabResultItem[];
  fileUrl?: string;
  requestedBy?: string;
}

export interface LabResultItem {
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
}

export interface RadiologyReport {
  id: string;
  type: string;
  date: string;
  findings: string;
  impression?: string;
  fileUrl?: string;
  radiologist?: string;
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  medications: Medication[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface VisitHistory {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  diagnosis?: string;
  notes?: string;
  appointmentId: string;
}

export interface PatientSummary {
  patient: Patient;
  recentVisits: VisitHistory[];
  activeAlerts: string[];
  labResultsSummary: LabResult[];
  currentMedications: Medication[];
}

// ─── Billing ──────────────────────────────────────────────────────────────
// FIX: Aligned BillStatus with backend PaymentStatus enum values
export type BillStatus = 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'WAIVED';

export interface Bill {
  id: string;
  billNumber?: string;
  patientName: string;
  patientId?: string;
  amount: number;
  total?: number;
  paidAmount?: number;
  // FIX: status now matches backend enum (was 'PENDING' | 'OVERDUE' | 'CANCELLED' - none of which exist in backend)
  status: BillStatus;
  dueDate: string;
  createdAt: string;
  items?: BillItem[];
  appointmentId?: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────
export interface DashboardStats {
  // Appointments — today
  totalAppointmentsToday: number;
  completedToday: number;
  pendingAppointments: number;
  cancelledToday: number;
  noShowToday: number;
  confirmedToday: number;
  appointmentGrowth: number | null;
  // People
  totalPatients: number;
  totalDoctors: number;
  newPatientsThisMonth: number;
  newPatientsGrowth: number | null;
  // Revenue
  totalRevenue: number;
  prevRevenue: number;
  revenueGrowth: number | null;
  // Billing
  totalUnpaidBills: number;
  // Waitlist
  waitlistCount: number;
}

// ─── Notification ─────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ─── Branch ───────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  nameAr: string;
  nameEn?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}