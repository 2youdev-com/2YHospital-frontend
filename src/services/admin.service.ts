// src/services/admin.service.ts
import apiClient from './api.client';
import type { DashboardStats, Branch, Specialty } from '@/types';

export const adminService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await apiClient.get('/admin/dashboard');
    return data.data;
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────
  async getWeeklyAppointments(): Promise<{ day: string; date: string; مواعيد: number; مكتملة: number; ملغاة: number }[]> {
    const { data } = await apiClient.get('/admin/analytics/weekly-appointments');
    return data.data ?? [];
  },

  async getMonthlyRevenue(): Promise<{ month: string; إيرادات: number; فواتير: number }[]> {
    const { data } = await apiClient.get('/admin/analytics/monthly-revenue');
    return data.data ?? [];
  },

  async getMonthlyAppointments(): Promise<{ month: string; مواعيد: number; مكتملة: number; ملغاة: number; 'لم يحضر': number }[]> {
    const { data } = await apiClient.get('/admin/analytics/monthly-appointments');
    return data.data ?? [];
  },

  async getSpecialtyDistribution(): Promise<{ name: string; value: number }[]> {
    const { data } = await apiClient.get('/admin/analytics/specialty-distribution');
    return data.data ?? [];
  },

  async getDoctorsStatus(): Promise<{
    id: string; name: string; specialty: string;
    status: 'available' | 'busy' | 'off';
    next: string | null; appointmentsToday: number; completedToday: number;
  }[]> {
    const { data } = await apiClient.get('/admin/analytics/doctors-status');
    return data.data ?? [];
  },

  async getRecentAppointments(limit = 5): Promise<{
    id: string; refNum: string; patient: string; mrn: string;
    doctor: string; specialty: string; time: string; status: string;
  }[]> {
    const { data } = await apiClient.get('/admin/analytics/recent-appointments', { params: { limit } });
    return data.data ?? [];
  },

  // ─── Users ──────────────────────────────────────────────────────────────────
  async getUsers(params?: { role?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data.data;
  },

  async toggleUserStatus(id: string) {
    const { data } = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return data.data;
  },

  // ─── Branches ───────────────────────────────────────────────────────────────
  async getBranches(): Promise<Branch[]> {
    const { data } = await apiClient.get('/admin/branches');
    return data.data;
  },

  async createBranch(payload: Partial<Branch>) {
    const { data } = await apiClient.post('/admin/branches', payload);
    return data.data;
  },

  async updateBranch(id: string, payload: Partial<Branch>) {
    const { data } = await apiClient.put(`/admin/branches/${id}`, payload);
    return data.data;
  },

  // ─── Specialties ────────────────────────────────────────────────────────────
  async createSpecialty(payload: Partial<Specialty>) {
    const { data } = await apiClient.post('/admin/specialties', payload);
    return data.data;
  },

  // ─── Audit & Reports ────────────────────────────────────────────────────────
  async getAuditLogs(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data;
  },

  async getRevenueReport(from: string, to: string) {
    const { data } = await apiClient.get('/admin/reports/revenue', { params: { from, to } });
    return data.data;
  },
};