import apiClient from './api.client';
import type { AuthTokens } from '@/types';

export const authService = {
  async sendOtp(phone: string) {
    const { data } = await apiClient.post('/auth/send-otp', { phone });
    return data;
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/verify-otp', { phone, otp });
    return data.data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await apiClient.post('/auth/refresh-token', { refreshToken });
    return data.data;
  },

  async logout(refreshToken: string) {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async getMe() {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },
};
