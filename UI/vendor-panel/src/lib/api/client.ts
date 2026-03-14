import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vendor_token');
    const tenantId = localStorage.getItem('vendor_tenant_id');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap double-wrapped responses: { success, data: { success, data: actual } }
    const d = response.data;
    if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
      const inner = d.data;
      if (inner && typeof inner === 'object' && 'success' in inner && 'data' in inner) {
        response.data = inner;
      }
    }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      // Don't redirect for /auth/me failures (vendor JWT may not support it)
      const url = error.config?.url || '';
      if (!url.includes('/auth/me')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vendor_token');
          localStorage.removeItem('vendor_tenant_id');
          document.cookie = 'vendor_token=; path=/; max-age=0';
          window.location.href = '/login';
        }
        toast.error('Session expired. Please login again.');
      }
    } else if (status === 403) {
      toast.error('You do not have permission for this action.');
    } else if (status === 422) {
      toast.error(message);
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (status !== undefined && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
