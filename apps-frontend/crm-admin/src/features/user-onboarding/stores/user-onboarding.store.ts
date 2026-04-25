'use client';

import { create } from 'zustand';
import { userOnboardingService } from '../user-onboarding.service';
import type { OnboardingStatus, OnboardingLocale, OnboardingUserType, OnboardingStage } from '../user-onboarding.service';

interface UserOnboardingState {
  status: OnboardingStatus | null;
  loading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  setLocale: (locale: OnboardingLocale) => Promise<void>;
  sendOtp: (type: 'email' | 'mobile') => Promise<{ sentTo: string; expiresAt: string }>;
  verifyOtp: (type: 'email' | 'mobile', code: string) => Promise<{ nextStage: OnboardingStage }>;
  skipMobile: () => Promise<void>;
  setUserType: (userType: OnboardingUserType) => Promise<void>;
  setSubType: (subTypeCode: string) => Promise<void>;
  completeProfile: (profileFields: Record<string, unknown>, verticalCode?: string) => Promise<void>;
  clearError: () => void;
}

export const useUserOnboardingStore = create<UserOnboardingState>((set, get) => ({
  status: null,
  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true, error: null });
    try {
      const status = await userOnboardingService.getStatus();
      set({ status, loading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? e?.message ?? 'Failed to load', loading: false });
    }
  },

  setLocale: async (locale) => {
    await userOnboardingService.setLocale(locale);
    await get().fetchStatus();
  },

  sendOtp: async (type) => {
    return userOnboardingService.sendOtp(type);
  },

  verifyOtp: async (type, code) => {
    const result = await userOnboardingService.verifyOtp(type, code);
    await get().fetchStatus();
    return result;
  },

  skipMobile: async () => {
    await userOnboardingService.skipMobile();
    await get().fetchStatus();
  },

  setUserType: async (userType) => {
    await userOnboardingService.setUserType(userType);
    await get().fetchStatus();
  },

  setSubType: async (subTypeCode) => {
    await userOnboardingService.setSubType(subTypeCode);
    await get().fetchStatus();
  },

  completeProfile: async (profileFields, verticalCode) => {
    await userOnboardingService.completeProfile(profileFields, verticalCode);
    await get().fetchStatus();
  },

  clearError: () => set({ error: null }),
}));
