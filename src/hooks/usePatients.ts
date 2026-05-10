// src/hooks/usePatients.ts
import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import type { Patient, PatientSummary } from '@/types';

export function usePatients(params?: { page?: number; limit?: number }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;

  useEffect(() => {
    const cacheKey = `patients:list:${page}:${limit}`;
    const cached = getCached<{ data: Patient[]; total: number }>(cacheKey, TTL.MEDIUM);
    if (cached) {
      setPatients(cached.data);
      setTotal(cached.total);
      setIsLoading(false);
      return;
    }
    adminService.getUsers({ role: 'PATIENT', page, limit })
      .then((res) => {
        const data = res.data ?? [];
        const tot = res.pagination?.total ?? 0;
        setPatients(data);
        setTotal(tot);
        setCached(cacheKey, { data, total: tot });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page, limit]);

  return { patients, isLoading, total };
}

export function usePatientSummary(patientId: string) {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    const cacheKey = `patients:summary:${patientId}`;
    const cached = getCached<PatientSummary>(cacheKey, TTL.MEDIUM);
    if (cached) {
      setSummary(cached);
      setIsLoading(false);
      return;
    }
    medicalRecordsService.getPatientSummary(patientId)
      .then((data) => {
        setSummary(data);
        setCached(cacheKey, data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [patientId]);

  return { summary, isLoading };
}