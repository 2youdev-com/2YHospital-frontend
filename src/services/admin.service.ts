import apiClient from './api.client';
import type { DashboardStats, Branch, Specialty } from '@/types';

export const adminService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await apiClient.get('/admin/dashboard');
    return data.data;
  },

  async getUsers(params?: { role?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  async toggleUserStatus(id: string) {
    const { data } = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return data.data;
  },

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

  async createSpecialty(payload: Partial<Specialty>) {
    const { data } = await apiClient.post('/admin/specialties', payload);
    return data.data;
  },

  async getAuditLogs(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data;
  },

  async getRevenueReport(from: string, to: string) {
    const { data } = await apiClient.get('/admin/reports/revenue', { params: { from, to } });
    return data.data;
  },
};
