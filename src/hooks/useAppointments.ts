// src/hooks/useAppointments.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { appointmentsService } from '@/services/appointments.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import type { Appointment, AppointmentStatus } from '@/types';

interface UseAppointmentsOptions {
  role?: 'admin' | 'doctor' | 'patient';
  status?: AppointmentStatus | '';
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { role = 'admin', status = '', page = 1, limit = 20, autoFetch = true } = options;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const paramsRef = useRef({ role, status, page, limit });
  paramsRef.current = { role, status, page, limit };

  const fetch = useCallback(async (skipCache = false) => {
    const { role, status, page, limit } = paramsRef.current;
    const cacheKey = `appointments:${role}:${status}:${page}:${limit}`;

    if (!skipCache) {
      const cached = getCached<{ data: Appointment[]; total: number }>(cacheKey, TTL.SHORT);
      if (cached) {
        setAppointments(cached.data);
        setTotal(cached.total);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      if (role === 'doctor') {
        const data = await appointmentsService.getTodaySchedule();
        setAppointments(data);
        setTotal(data.length);
        setCached(cacheKey, { data, total: data.length });
        return;
      }

      const res = role === 'patient'
        ? await appointmentsService.getMyAppointments({ status: status || undefined, page, limit })
        : await appointmentsService.getAllAppointments({ status: status || undefined, page, limit });

      const data = res.data ?? [];
      const tot = res.pagination?.total ?? 0;
      setAppointments(data);
      setTotal(tot);
      setCached(cacheKey, { data, total: tot });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'فشل تحميل المواعيد');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, role, status, page, limit]);

  const cancel = useCallback(async (id: string, reason?: string) => {
    await appointmentsService.cancel(id, reason);
    setAppointments((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' as AppointmentStatus } : a)
    );
  }, []);

  return { appointments, isLoading, error, total, refetch: () => fetch(true), cancel };
}

export function useTodaySchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'appointments:today';
    const cached = getCached<Appointment[]>(cacheKey, TTL.SHORT);
    if (cached) {
      setAppointments(cached);
      setIsLoading(false);
      return;
    }
    appointmentsService.getTodaySchedule()
      .then((data) => {
        setAppointments(data);
        setCached(cacheKey, data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { appointments, isLoading };
}