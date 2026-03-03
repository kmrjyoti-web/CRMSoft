import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User, LoginResponse } from "@/features/auth/types/auth.types";
import { decodeToken } from "@/features/auth/utils/jwt-decode";

// ── Re-exports for convenience ──────────────────────────

export type { User, LoginResponse };

// ── Store ───────────────────────────────────────────────

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantId: string | null;
  tenantCode: string | null;
  roles: string[];
  isAuthenticated: boolean;

  setAuth: (res: Partial<LoginResponse> & { accessToken: string }) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

const INITIAL_STATE = {
  token: null,
  refreshToken: null,
  user: null,
  tenantId: null,
  tenantCode: null,
  roles: [] as string[],
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setAuth: (res) => {
        const decoded = decodeToken(res.accessToken);

        const user: User | undefined = res.user ?? undefined;
        const roles = decoded?.role ? [decoded.role] : [];

        set((state) => ({
          token: res.accessToken,
          refreshToken: res.refreshToken ?? state.refreshToken,
          user: user ?? state.user ?? {
            id: decoded?.sub ?? "",
            email: decoded?.email ?? "",
            firstName: "",
            lastName: "",
            userType: decoded?.userType ?? "",
            role: decoded?.role ?? "",
          },
          tenantId: decoded?.tenantId ?? state.tenantId ?? null,
          tenantCode: decoded?.tenantCode ?? res.tenantCode ?? state.tenantCode ?? null,
          roles,
          isAuthenticated: true,
        }));
      },

      clearAuth: () => set({ ...INITIAL_STATE }),

      setUser: (user) => set({ user }),
    }),
    { name: "crm-auth" },
  ),
);
