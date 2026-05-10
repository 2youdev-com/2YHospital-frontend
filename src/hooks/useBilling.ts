// src/hooks/useBilling.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { billingService } from '@/services/billing.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import type { Bill, BillStatus } from '@/types';

export function useBilling(params?: {
  status?: BillStatus | '';
  page?: number;
  limit?: number;
  role?: 'admin' | 'patient';
}) {
  const { role = 'admin', status = '', page = 1, limit = 20 } = params ?? {};

  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const paramsRef = useRef({ role, status, page, limit });
  paramsRef.current = { role, status, page, limit };

  const fetch = useCallback(async (skipCache = false) => {
    const { role, status, page, limit } = paramsRef.current;
    const cacheKey = `billing:${role}:${status}:${page}:${limit}`;

    if (!skipCache) {
      const cached = getCached<{ data: Bill[]; total: number }>(cacheKey, TTL.MEDIUM);
      if (cached) {
        setBills(cached.data);
        setTotal(cached.total);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      const apiParams = { status: status || undefined, page, limit };
      const res = role === 'patient'
        ? await billingService.getMyBills(apiParams)
        : await billingService.getAllBills(apiParams);
      const data = res.data ?? [];
      const tot = res.pagination?.total ?? 0;
      setBills(data);
      setTotal(tot);
      setCached(cacheKey, { data, total: tot });
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, page, limit]);

  return { bills, isLoading, total, refetch: () => fetch(true) };
}