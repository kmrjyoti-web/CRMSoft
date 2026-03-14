import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vendor } from '@/types/user';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  vendor: Vendor | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setAuth: (token: string, tenantId: string, user: User, vendor?: Vendor) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      vendor: null,
      token: null,
      tenantId: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          const data = res.data;
          localStorage.setItem('vendor_token', data.accessToken);
          localStorage.setItem('vendor_tenant_id', data.tenantId);
          // Set cookie so Next.js middleware can detect auth
          document.cookie = `vendor_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          set({
            token: data.accessToken,
            tenantId: data.tenantId,
            user: data.user,
            vendor: data.vendor ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          // Re-throw original error so login page can read status + message
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('vendor_token');
        localStorage.removeItem('vendor_tenant_id');
        // Clear the cookie so middleware redirects to login
        document.cookie = 'vendor_token=; path=/; max-age=0';
        set({ user: null, vendor: null, token: null, tenantId: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await authApi.getMe();
          set({ user: res.data });
        } catch {
          // If fails, likely token expired
        }
      },

      setAuth: (token, tenantId, user, vendor) => {
        localStorage.setItem('vendor_token', token);
        localStorage.setItem('vendor_tenant_id', tenantId);
        document.cookie = `vendor_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        set({ token, tenantId, user, vendor: vendor ?? null, isAuthenticated: true });
      },
    }),
    {
      name: 'vendor-auth',
      partialize: (state) => ({
        token: state.token,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
