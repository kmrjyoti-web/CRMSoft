import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Vendor } from '@/types/user';

export const profileApi = {
  get: () =>
    apiClient.get<ApiResponse<Vendor>>('/marketplace/vendors/me').then((r) => r.data),

  update: (data: Partial<Vendor>) =>
    apiClient.patch<ApiResponse<Vendor>>('/marketplace/vendors/me', data).then((r) => r.data),

  verifyGst: (gstNumber: string, companyName: string) =>
    apiClient.post<ApiResponse<void>>('/verification/gst/submit', { gstNumber, companyName }).then((r) => r.data),

  getVerificationStatus: () =>
    apiClient.get<ApiResponse<{ emailVerified: boolean; mobileVerified: boolean; gstVerified: boolean }>>('/verification/status').then((r) => r.data),
};
