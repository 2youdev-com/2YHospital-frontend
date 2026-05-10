// src/services/notifications.service.ts
import apiClient from './api.client';
import type { Notification } from '@/types';

export const notificationsService = {
  async getMyNotifications(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    // Backend returns { data: { items: [], unreadCount: N } }
    // Guard against both shapes just in case
    const payload = data.data;
    if (Array.isArray(payload)) return payload;
    return payload?.items ?? [];
  },

  async markAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await apiClient.patch('/notifications/read-all');
  },
};