import api from '../lib/api';

export const pricingService = {
  listServices: () => api.get('/pricing/services').then((r) => r.data),
  getPartnerPricing: (partnerId: string) => api.get(`/pricing/partner/${partnerId}`).then((r) => r.data),
  setPartnerPricing: (dto: any) => api.post('/pricing/partner', dto).then((r) => r.data),
  setCustomerPricing: (dto: any) => api.post('/pricing/customer', dto).then((r) => r.data),
  getPricingChain: (partnerId: string, serviceCode: string) => api.get(`/pricing/chain/${partnerId}/${serviceCode}`).then((r) => r.data),
};
