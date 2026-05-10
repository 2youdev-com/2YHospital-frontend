// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { getCached, setCached, invalidateCache, TTL } from '@/lib/cache';
import type { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async (skipCache = false) => {
    const cacheKey = 'notifications:list';
    if (!skipCache) {
      const cached = getCached<Notification[]>(cacheKey, TTL.SHORT);
      if (cached) {
        setNotifications(cached);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(true);
    try {
      const data = await notificationsService.getMyNotifications();
      setNotifications(data);
      setCached(cacheKey, data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    invalidateCache('notifications:');
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    invalidateCache('notifications:');
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, refetch: () => fetch(true) };
}