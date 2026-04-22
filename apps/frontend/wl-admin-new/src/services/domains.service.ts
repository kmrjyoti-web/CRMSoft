import api from '../lib/api';

export const domainsService = {
  list: (partnerId: string) => api.get(`/domains/${partnerId}`).then((r) => r.data),
  add: (dto: any) => api.post('/domains', dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/domains/${id}`).then((r) => r.data),
  verify: (id: string) => api.post(`/domains/${id}/verify`).then((r) => r.data),
  getDnsRecords: (id: string) => api.get(`/domains/${id}/dns-records`).then((r) => r.data),
};
