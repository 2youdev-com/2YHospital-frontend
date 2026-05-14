import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = BASE_URL || 'http://localhost:3001/api/v1';

if (!BASE_URL && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not defined. Using default localhost for development.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        clearAuthCookies();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        Cookies.set('accessToken', newToken, { expires: 1 });
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthCookies();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function clearAuthCookies() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('userRole');
  Cookies.remove('userId');
}

export default apiClient;
