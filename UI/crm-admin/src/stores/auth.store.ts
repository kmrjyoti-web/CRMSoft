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
  tenantName: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  onboardingStep: string | null;

  setAuth: (res: Partial<LoginResponse> & { accessToken: string; tenant?: { name?: string; onboardingStep?: string } }) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setOnboardingStep: (step: string) => void;
}

const INITIAL_STATE = {
  token: null,
  refreshToken: null,
  user: null,
  tenantId: null,
  tenantCode: null,
  tenantName: null as string | null,
  roles: [] as string[],
  isAuthenticated: false,
  isSuperAdmin: false,
  onboardingStep: null as string | null,
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
          tenantName: (res as any)?.tenant?.name ?? state.tenantName ?? null,
          roles,
          isAuthenticated: true,
          isSuperAdmin: decoded?.isSuperAdmin === true,
          onboardingStep: (res as any)?.tenant?.onboardingStep ?? state.onboardingStep,
        }));
      },

      clearAuth: () => set({ ...INITIAL_STATE }),

      setUser: (user) => set({ user }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),
    }),
    { name: "crm-auth" },
  ),
);
