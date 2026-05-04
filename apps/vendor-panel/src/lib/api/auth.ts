import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { LoginResponse, User } from '@/types/user';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/vendor/login', { email, password }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }).then((r) => r.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};
