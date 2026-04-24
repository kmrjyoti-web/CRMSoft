'use client';

import { useState, useCallback } from 'react';

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
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

  const register = useCallback(async (params: RegisterParams): Promise<RegisterResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/auth/${params.verticalCode.toLowerCase()}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryCode: params.categoryCode,
            subcategoryCode: params.subcategoryCode,
            brandCode: params.brandCode,
            email: params.email,
            password: params.password,
            registrationFields: params.registrationFields ?? {},
          }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message ?? 'Registration failed';
        setError(msg);
        return { success: false, error: msg };
      }
      return {
        success: true,
        requiresApproval: json.data?.requiresApproval ?? false,
        message: json.data?.message,
      };
    } catch (e: any) {
      const msg = e.message ?? 'Network error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  return { register, isLoading, error };
}
