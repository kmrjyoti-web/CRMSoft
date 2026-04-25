import api from '@/services/api-client';

export type OnboardingStage =
  | 'language'
  | 'email_otp'
  | 'mobile_otp'
  | 'user_type'
  | 'sub_user_type'
  | 'profile_redirect'
  | 'complete';

export type OnboardingUserType = 'B2B' | 'B2C' | 'IND_SP' | 'IND_EE';
export type OnboardingLocale = 'en' | 'hi' | 'mr';

export interface OnboardingStatus {
  stage: OnboardingStage;
  emailVerified: boolean;
  mobileVerified: boolean;
  categoryCode: string | null;
  subcategoryCode: string | null;
  verticalCode: string | null;
  brandCode: string | null;
  locale: OnboardingLocale;
  complete: boolean;
}

export interface OtpSentInfo {
  sentTo: string;
  expiresAt: string;
}

export interface SubTypeOption {
  code: string;
  name: string;
  description?: string;
  parentCategory: string;
  requiresApproval: boolean;
}

export const userOnboardingService = {
  getStatus: (): Promise<OnboardingStatus> =>
    api.get('/api/v1/onboarding/status').then((r) => r.data.data),

  setLocale: (locale: OnboardingLocale): Promise<void> =>
    api.post('/api/v1/onboarding/locale', { locale }).then(() => undefined),

  sendOtp: (type: 'email' | 'mobile'): Promise<OtpSentInfo> =>
    api.post('/api/v1/onboarding/otp/send', { type }).then((r) => r.data.data),

  verifyOtp: (type: 'email' | 'mobile', code: string): Promise<{ nextStage: OnboardingStage }> =>
    api.post('/api/v1/onboarding/otp/verify', { type, code }).then((r) => r.data.data),

  skipMobile: (): Promise<void> =>
    api.post('/api/v1/onboarding/otp/skip-mobile').then(() => undefined),

  setUserType: (userType: OnboardingUserType): Promise<void> =>
    api.post('/api/v1/onboarding/user-type', { userType }).then(() => undefined),

  getSubTypes: (verticalCode: string, categoryCode: string): Promise<SubTypeOption[]> =>
    api
      .get('/api/v1/platform-console/creator/user-categories/subcategories', {
        params: { vertical_code: verticalCode, category_code: categoryCode },
      })
      .then((r) => r.data.data ?? r.data ?? []),

  setSubType: (subTypeCode: string): Promise<void> =>
    api.post('/api/v1/onboarding/sub-type', { subTypeCode }).then(() => undefined),

  completeProfile: (profileFields: Record<string, unknown>, verticalCode?: string): Promise<void> =>
    api
      .post('/api/v1/onboarding/complete-profile', { profileFields, ...(verticalCode ? { verticalCode } : {}) })
      .then(() => undefined),
};
