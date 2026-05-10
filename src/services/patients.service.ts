import apiClient from './api.client';
import type { Patient } from '@/types';

export const patientsService = {
  async getProfile(): Promise<Patient> {
    const { data } = await apiClient.get('/users/profile');
    return data.data;
  },

  async updateProfile(payload: Partial<Patient>) {
    const { data } = await apiClient.put('/users/profile', payload);
    return data.data;
  },

  async getDependents() {
    const { data } = await apiClient.get('/users/dependents');
    return data.data;
  },

  async addDependent(payload: Partial<Patient>) {
    const { data } = await apiClient.post('/users/dependents', payload);
    return data.data;
  },

  async removeDependent(id: string) {
    await apiClient.delete(`/users/dependents/${id}`);
  },

  async addAllergy(allergy: string) {
    const { data } = await apiClient.post('/users/allergies', { allergy });
    return data.data;
  },

  async removeAllergy(allergy: string) {
    await apiClient.delete(`/users/allergies/${encodeURIComponent(allergy)}`);
  },
};
