import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wl-partner-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('wl-partner-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
