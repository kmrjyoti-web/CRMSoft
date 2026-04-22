import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { portalAuthApi } from '@/lib/api/portal.api';
import type { PortalUser } from '@/types/portal';

// All available portal routes with metadata
export const ALL_PORTAL_ROUTES = [
  { key: '/', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { key: '/orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders' },
  { key: '/invoices', label: 'Invoices', icon: 'FileText', path: '/invoices' },
  { key: '/payments', label: 'Payments', icon: 'CreditCard', path: '/payments' },
  { key: '/support', label: 'Support', icon: 'MessageSquare', path: '/support' },
  { key: '/documents', label: 'Documents', icon: 'FolderOpen', path: '/documents' },
  { key: '/profile', label: 'Profile', icon: 'User', path: '/profile' },
] as const;

interface AuthState {
  user: PortalUser | null;
  token: string | null;
  availableRouteKeys: string[];
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      availableRouteKeys: [],
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await portalAuthApi.login(email, password);
          const { accessToken, user, menu: availableRoutes } = res.data;

          localStorage.setItem('portal_token', accessToken);
          document.cookie = `portal_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

          set({
            token: accessToken,
            user,
            availableRouteKeys: availableRoutes,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('portal_token');
        document.cookie = 'portal_token=; path=/; max-age=0';
        set({
          user: null,
          token: null,
          availableRouteKeys: [],
          isAuthenticated: false,
        });
      },

      refreshMe: async () => {
        try {
          const res = await portalAuthApi.getMe();
          set({ user: res.data });
        } catch {
          // Token may have expired — handled by axios interceptor
        }
      },
    }),
    {
      name: 'portal-auth',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        availableRouteKeys: state.availableRouteKeys,
      }),
    },
  ),
);
