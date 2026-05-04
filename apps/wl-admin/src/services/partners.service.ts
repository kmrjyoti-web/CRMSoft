import api from '../lib/api';

export const partnersService = {
  getAll: (params?: any) => api.get('/partners', { params }).then((r) => r.data),
  getOne: (id: string) => api.get(`/partners/${id}`).then((r) => r.data),
  create: (dto: any) => api.post('/partners', dto).then((r) => r.data),
  update: (id: string, dto: any) => api.patch(`/partners/${id}`, dto).then((r) => r.data),
  suspend: (id: string, reason: string) => api.post(`/partners/${id}/suspend`, { reason }).then((r) => r.data),
  activate: (id: string) => api.post(`/partners/${id}/activate`).then((r) => r.data),
  remove: (id: string) => api.delete(`/partners/${id}`).then((r) => r.data),
  getDashboard: () => api.get('/partners/dashboard').then((r) => r.data),
};
