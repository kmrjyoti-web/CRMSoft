'use client';

import { useState, useCallback } from 'react';
import api from '@/services/api-client';
import { setAuthCookie } from '@/features/auth/utils/auth-cookies';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiResponse } from '@/types/api-response';

export interface RegisterParams {
  verticalCode: string;
  categoryCode: string;
  subcategoryCode: string;
  brandCode: string;
  email: string;
  password: string;
  registrationFields?: Record<string, any>;
}

export interface RegisterResult {
  success: boolean;
  requiresApproval?: boolean;
  message?: string;
  error?: string;
  accessToken?: string;
}

interface RegisterApiData {
  requiresApproval: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Record<string, any>;
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (params: RegisterParams): Promise<RegisterResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<ApiResponse<RegisterApiData>>(
        `/api/v1/auth/${params.verticalCode.toLowerCase()}/register`,
        {
          categoryCode: params.categoryCode,
          subcategoryCode: params.subcategoryCode,
          brandCode: params.brandCode,
          email: params.email,
          password: params.password,
          registrationFields: params.registrationFields ?? {},
        },
      );

      const apiData = data.data as RegisterApiData;
      const requiresApproval = apiData?.requiresApproval ?? false;
      const accessToken = apiData?.accessToken;

      if (!requiresApproval && accessToken) {
        useAuthStore.getState().setAuth({ accessToken, user: apiData.user as any });
        setAuthCookie(accessToken);
      }

      return {
        success: true,
        requiresApproval,
        message: apiData?.message ?? (data as any).message,
        accessToken,
      };
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message ?? 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { register, isLoading, error };
}
