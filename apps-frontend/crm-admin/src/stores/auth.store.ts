import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User, LoginResponse } from "@/features/auth/types/auth.types";
import { decodeToken } from "@/features/auth/utils/jwt-decode";

// ── Re-exports for convenience ──────────────────────────

export type { User, LoginResponse };

// ── Store ───────────────────────────────────────────────

export interface ActiveCompany {
  id: string;
  name: string;
  brandCode: string | null;
  verticalCode: string | null;
  role: string;
  isDefault: boolean;
}

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
  terminology: Record<string, any> | null;
  industryCode: string | null;
  // Person-centric multi-brand fields (PR #50)
  activeCompany: ActiveCompany | null;
  activeCompanyBrandCode: string | null;
  availableCompanies: ActiveCompany[];

  setAuth: (res: Partial<LoginResponse> & { accessToken: string; tenant?: { name?: string; onboardingStep?: string; industryCode?: string } }) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setOnboardingStep: (step: string) => void;
  setTerminology: (t: Record<string, any>) => void;
  setActiveCompany: (company: ActiveCompany | null) => void;
  setAvailableCompanies: (companies: ActiveCompany[]) => void;
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
  terminology: null as Record<string, any> | null,
  industryCode: null as string | null,
  activeCompany: null as ActiveCompany | null,
  activeCompanyBrandCode: null as string | null,
  availableCompanies: [] as ActiveCompany[],
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
          terminology: (res as any)?.terminology ?? state.terminology,
          industryCode: (res as any)?.tenant?.industryCode ?? state.industryCode,
        }));
      },

      clearAuth: () => set({ ...INITIAL_STATE }),

      setUser: (user) => set({ user }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setTerminology: (t) => set({ terminology: t }),

      setActiveCompany: (company) => set({
        activeCompany: company,
        activeCompanyBrandCode: company?.brandCode ?? null,
      }),

      setAvailableCompanies: (companies) => set({ availableCompanies: companies }),
    }),
    { name: "crm-auth" },
  ),
);
