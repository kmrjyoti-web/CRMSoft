import { create } from "zustand";

// ── Permission Store ───────────────────────────────────

export interface PermissionState {
  codes: string[];
  features: string[];
  loaded: boolean;

  setCodes: (codes: string[]) => void;
  setFeatures: (features: string[]) => void;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
  hasFeature: (feature: string) => boolean;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>()((set, get) => ({
  codes: [],
  features: [],
  loaded: false,

  setCodes: (codes) => set({ codes, loaded: true }),
  setFeatures: (features) => set({ features }),

  hasPermission: (code) => get().codes.includes(code),
  hasAnyPermission: (codes) => codes.some((c) => get().codes.includes(c)),
  hasAllPermissions: (codes) => codes.every((c) => get().codes.includes(c)),
  hasFeature: (feature) => get().features.includes(feature),

  reset: () => set({ codes: [], features: [], loaded: false }),
}));
