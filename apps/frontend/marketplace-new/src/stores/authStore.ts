import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../services/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mp_token', token);
          localStorage.setItem('mp_refresh_token', refreshToken);
        }
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mp_token');
          localStorage.removeItem('mp_refresh_token');
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    { name: 'mp_auth', skipHydration: true },
  ),
);
