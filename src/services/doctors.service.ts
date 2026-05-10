import apiClient from './api.client';
import type { Doctor, Specialty } from '@/types';

const dayIndex: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function normalizeDoctor(raw: any): Doctor {
  const schedules = raw?.schedule ?? raw?.schedules ?? [];
  const specialty = typeof raw?.specialty === 'string'
    ? raw.specialty
    : raw?.specialty?.nameAr ?? raw?.specialty?.nameEn ?? '';

  return {
    ...raw,
    id: raw?.id ?? '',
    name: raw?.name ?? raw?.nameAr ?? raw?.nameEn ?? '',
    specialty,
    specialtyId: raw?.specialtyId ?? raw?.specialty?.id,
    branch: raw?.branch ?? raw?.branch?.nameAr ?? raw?.branch?.nameEn,
    branchId: raw?.branchId ?? raw?.branch?.id,
    phone: raw?.phone ?? raw?.user?.phone,
    isActive: raw?.isActive ?? raw?.isAvailable ?? true,
    consultationFee: raw?.consultationFee,
    bio: raw?.bio,
    avatar: raw?.avatar,
    schedule: Array.isArray(schedules)
      ? schedules.map((slot: any) => ({
          ...slot,
          dayOfWeek: typeof slot.dayOfWeek === 'number' ? slot.dayOfWeek : dayIndex[slot.dayOfWeek] ?? 0,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDurationMinutes: slot.slotDurationMinutes ?? slot.slotDuration ?? 20,
          isBlocked: slot.isBlocked ?? slot.isActive === false,
        }))
      : [],
    stats: raw?.stats,
  };
}

export const doctorsService = {
  async search(params?: { name?: string; specialty?: string; branch?: string }) {
    const { data } = await apiClient.get('/doctors/search', { params });
    return Array.isArray(data.data) ? data.data.map(normalizeDoctor) : [];
  },

  async getSpecialties(): Promise<Specialty[]> {
    const { data } = await apiClient.get('/doctors/specialties');
    return data.data;
  },

  async getProfile(id: string): Promise<Doctor> {
    const { data } = await apiClient.get(`/doctors/${id}`);
    return normalizeDoctor(data.data);
  },

  // Doctor self
  async getMyProfile(): Promise<Doctor> {
    const { data } = await apiClient.get('/doctors/me/profile');
    return normalizeDoctor(data.data);
  },

  async updateMyProfile(payload: Partial<Doctor>) {
    const { data } = await apiClient.put('/doctors/me/profile', payload);
    return normalizeDoctor(data.data);
  },

  async setSchedule(schedule: unknown[]) {
    const schedules = schedule.map((slot: any) => ({
      ...slot,
      slotDuration: slot.slotDuration ?? slot.slotDurationMinutes,
      isActive: slot.isActive ?? !slot.isBlocked,
    }));
    const { data } = await apiClient.put('/doctors/me/schedule', { schedules });
    return data.data;
  },

  async blockSlot(scheduleId: string, payload: { date: string; reason?: string }) {
    const { data } = await apiClient.post(`/doctors/me/schedule/${scheduleId}/block`, payload);
    return data.data;
  },

  async getMyStats() {
    const { data } = await apiClient.get('/doctors/me/stats');
    return data.data;
  },

  // Admin
  async createDoctor(payload: Partial<Doctor> & { phone: string; specialtyId: string }) {
    const { data } = await apiClient.post('/doctors', payload);
    return data.data;
  },
};
