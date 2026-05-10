import apiClient from './api.client';
import type { Bill } from '@/types';

export const billingService = {
  // Patient
  async getMyBills(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/billing/my', { params });
    return data;
  },

  async getMyBill(id: string): Promise<Bill> {
    const { data } = await apiClient.get(`/billing/my/${id}`);
    return data.data;
  },

  async payBill(id: string, method: string) {
    const { data } = await apiClient.post(`/billing/my/${id}/pay`, { method });
    return data.data;
  },

  async createPaymentIntent(billId: string) {
    const { data } = await apiClient.post(`/billing/my/${billId}/payment-intent`);
    return data.data;
  },

  // Admin / Finance
  async getAllBills(params?: { status?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/billing', { params });
    return data;
  },

  async createBill(payload: Partial<Bill> & { patientId: string; appointmentId?: string }) {
    const { data } = await apiClient.post('/billing', payload);
    return data.data;
  },
};
