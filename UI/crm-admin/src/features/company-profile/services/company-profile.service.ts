import apiClient from '@/services/api-client';

export const companyProfileService = {
  get: () =>
    apiClient.get('/api/v1/settings/company').then((r) => {
      const d = r.data as any;
      return d?.data ?? d;
    }),

  update: (data: Record<string, any>) =>
    apiClient.put('/api/v1/settings/company', data).then((r) => {
      const d = r.data as any;
      return d?.data ?? d;
    }),
};
