import api from '../lib/api';

export const partnerService = {
  getDashboard: () => api.get('/partner/dashboard').then((r) => r.data),
  getProfile: () => api.get('/partner/profile').then((r) => r.data),
  getBranding: () => api.get('/partner/branding').then((r) => r.data),
  updateBranding: (dto: any) => api.patch('/partner/branding', dto).then((r) => r.data),
  getDomains: () => api.get('/partner/domains').then((r) => r.data),
  addDomain: (dto: any) => api.post('/partner/domains', dto).then((r) => r.data),
  removeDomain: (id: string) => api.delete(`/partner/domains/${id}`).then((r) => r.data),
  verifyDomain: (id: string) => api.post(`/partner/domains/${id}/verify`).then((r) => r.data),
  getPricing: () => api.get('/partner/pricing').then((r) => r.data),
  setCustomerPricing: (dto: any) => api.post('/partner/pricing/customer', dto).then((r) => r.data),
  getUsage: () => api.get('/partner/usage').then((r) => r.data),
  getBilling: () => api.get('/partner/billing').then((r) => r.data),
};
