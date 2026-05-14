import apiClient from './api.client';
import type { Appointment, TimeSlot } from '@/types';
import { normalizeDoctor } from './doctors.service';

function normalizeAppointment(raw: any): Appointment {
  return {
    ...raw,
    date: raw?.date ?? '',
    time: raw?.time ?? raw?.startTime ?? '',
    doctor: normalizeDoctor(raw?.doctor ?? {}),
    patient: raw?.patient
      ? {
          ...raw.patient,
          name: raw.patient.name ?? raw.patient.nameAr ?? raw.patient.nameEn ?? '',
          phone: raw.patient.phone ?? raw.patient.user?.phone,
        }
      : undefined,
    branch:
      typeof raw?.branch === 'string'
        ? raw.branch
        : raw?.branch?.nameAr ?? raw?.branch?.nameEn,
  };
}

function normalizePaginatedAppointments(raw: any) {
  return {
    ...raw,
    data: Array.isArray(raw?.data) ? raw.data.map(normalizeAppointment) : [],
  };
}

export const appointmentsService = {
  // Patient
  async getSlots(doctorId: string, date: string, branchId?: string): Promise<TimeSlot[]> {
    const { data } = await apiClient.get('/appointments/slots', {
      params: { doctorId, date, branchId },
    });
    // FIX: Backend returns plain string array of times, normalize to TimeSlot[]
    const raw = data.data;
    if (Array.isArray(raw) && typeof raw[0] === 'string') {
      return raw.map((time: string) => ({ time, available: true }));
    }
    return raw;
  },

  async book(payload: {
    doctorId: string;
    patientId?: string;
    date: string;
    time: string;
    branchId?: string;
    reason?: string;
    type?: string;
    dependentId?: string;
  }): Promise<Appointment> {
    // FIX: Backend expects 'startTime' not 'time'
    const { time, ...rest } = payload;
    const { data } = await apiClient.post('/appointments', { ...rest, startTime: time });
    return normalizeAppointment(data.data);
  },

  async getMyAppointments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get('/appointments/my', { params });
    return normalizePaginatedAppointments(data);
  },

  async getMyAppointment(id: string): Promise<Appointment> {
    const { data } = await apiClient.get(`/appointments/my/${id}`);
    return normalizeAppointment(data.data);
  },

  async cancel(id: string, reason?: string) {
    const { data } = await apiClient.patch(`/appointments/my/${id}/cancel`, { reason });
    return data.data;
  },

  async reschedule(id: string, newDate: string, newTime: string) {
    const { data } = await apiClient.patch(`/appointments/my/${id}/reschedule`, {
      newDate,
      newTime,
    });
    return normalizeAppointment(data.data);
  },

  // Doctor
  async getTodaySchedule(): Promise<Appointment[]> {
    const { data } = await apiClient.get('/appointments/today');
    return Array.isArray(data.data) ? data.data.map(normalizeAppointment) : [];
  },

  async getDoctorAppointment(id: string): Promise<Appointment> {
    const { data } = await apiClient.get(`/appointments/doctor/${id}`);
    return normalizeAppointment(data.data);
  },

  async updateDoctorAppointmentStatus(id: string, status: string) {
    const { data } = await apiClient.patch(`/appointments/doctor/${id}/status`, { status });
    return normalizeAppointment(data.data);
  },

  // Admin / Receptionist
  async getAllAppointments(params?: {
    status?: string;
    doctorId?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get('/appointments', { params });
    return normalizePaginatedAppointments(data);
  },

  async getAdminAppointment(id: string): Promise<Appointment> {
    const { data } = await apiClient.get(`/appointments/${id}`);
    return normalizeAppointment(data.data);
  },

  async cancelAdmin(id: string, reason?: string) {
    const { data } = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
    return data.data;
  },

  async updateAdminStatus(id: string, status: string) {
    const { data } = await apiClient.patch(`/appointments/${id}/status`, { status });
    return normalizeAppointment(data.data);
  },
};