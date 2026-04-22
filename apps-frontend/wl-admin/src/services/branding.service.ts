import api from '../lib/api';

export const brandingService = {
  get: (partnerId: string) => api.get(`/branding/${partnerId}`).then((r) => r.data),
  create: (dto: any) => api.post('/branding', dto).then((r) => r.data),
  update: (partnerId: string, dto: any) => api.patch(`/branding/${partnerId}`, dto).then((r) => r.data),
};
