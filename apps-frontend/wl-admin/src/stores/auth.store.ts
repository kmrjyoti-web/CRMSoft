'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: string | null;
  email: string | null;
  setAuth: (token: string, role: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      email: null,
      setAuth: (token, role, email) => {
        localStorage.setItem('wl-admin-token', token);
        set({ token, role, email });
      },
      logout: () => {
        localStorage.removeItem('wl-admin-token');
        set({ token: null, role: null, email: null });
      },
    }),
    { name: 'wl-admin-auth' }
  )
);
