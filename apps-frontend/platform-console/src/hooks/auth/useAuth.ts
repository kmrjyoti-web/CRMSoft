'use client';

import { useState, useCallback } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  brandCode?: string;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Placeholder — replace with real auth API call when identity service is wired
      setUser({ id: 'dev', email, role: 'ADMIN' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
  };
}
