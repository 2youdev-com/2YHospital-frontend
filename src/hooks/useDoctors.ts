// src/hooks/useDoctors.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { doctorsService } from '@/services/doctors.service';
import { getCached, setCached, TTL } from '@/lib/cache';
import type { Doctor, Specialty } from '@/types';

export function useDoctors(searchParams?: { name?: string; specialty?: string; branch?: string }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef(searchParams);
  paramsRef.current = searchParams;

  const fetch = useCallback(async (skipCache = false) => {
    const params = paramsRef.current;
    const cacheKey = `doctors:search:${JSON.stringify(params ?? {})}`;

    if (!skipCache) {
      const cached = getCached<Doctor[]>(cacheKey, TTL.MEDIUM);
      if (cached) {
        setDoctors(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorsService.search(params);
      setDoctors(data);
      setCached(cacheKey, data);
    } catch {
      setError('فشل تحميل قائمة الأطباء');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const name = searchParams?.name ?? '';
  const specialty = searchParams?.specialty ?? '';
  const branch = searchParams?.branch ?? '';

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, specialty, branch]);

  return { doctors, isLoading, error, refetch: () => fetch(true) };
}

export function useSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'doctors:specialties';
    const cached = getCached<Specialty[]>(cacheKey, TTL.LONG);
    if (cached) {
      setSpecialties(cached);
      setIsLoading(false);
      return;
    }
    doctorsService.getSpecialties()
      .then((data) => {
        setSpecialties(data);
        setCached(cacheKey, data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { specialties, isLoading };
}

export function useDoctorProfile(id: string) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const cacheKey = `doctors:profile:${id}`;
    const cached = getCached<Doctor>(cacheKey, TTL.MEDIUM);
    if (cached) {
      setDoctor(cached);
      setIsLoading(false);
      return;
    }
    doctorsService.getProfile(id)
      .then((data) => {
        setDoctor(data);
        setCached(cacheKey, data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  return { doctor, isLoading, setDoctor };
}

export function useMyDoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'doctors:me';
    const cached = getCached<Doctor>(cacheKey, TTL.SHORT);
    if (cached) {
      setDoctor(cached);
      setIsLoading(false);
      return;
    }
    doctorsService.getMyProfile()
      .then((data) => {
        setDoctor(data);
        setCached(cacheKey, data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { doctor, isLoading, setDoctor };
}