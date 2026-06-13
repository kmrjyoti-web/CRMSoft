'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  partnerId: string | null;
  partnerCode: string | null;
  email: string | null;
  setAuth: (token: string, partnerId: string, partnerCode: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      partnerId: null,
      partnerCode: null,
      email: null,
      setAuth: (token, partnerId, partnerCode, email) => {
        localStorage.setItem('wl-partner-token', token);
        set({ token, partnerId, partnerCode, email });
      },
      logout: () => {
        localStorage.removeItem('wl-partner-token');
        set({ token: null, partnerId: null, partnerCode: null, email: null });
      },
    }),
    { name: 'wl-partner-auth' }
  )
);
