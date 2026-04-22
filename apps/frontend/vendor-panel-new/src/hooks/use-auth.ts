'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
