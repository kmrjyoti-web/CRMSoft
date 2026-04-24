import api from '../lib/api';

export const authService = {
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
};
