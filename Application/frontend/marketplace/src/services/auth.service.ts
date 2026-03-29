import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  avatar?: string;
  phone?: string;
  role?: string;
}

export interface LoginResponse {
  data: { accessToken: string; refreshToken: string; user: AuthUser };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse['data']> {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },

  async register(payload: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
  }): Promise<LoginResponse['data']> {
    const res = await api.post<LoginResponse>('/auth/register', payload);
    return res.data;
  },

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const res = await api.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken: token });
    return res.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mp_token');
      localStorage.removeItem('mp_refresh_token');
      localStorage.removeItem('mp_user');
    }
  },
};
