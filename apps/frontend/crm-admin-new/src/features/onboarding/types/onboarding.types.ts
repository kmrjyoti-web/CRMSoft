export type OnboardingStep =
  | "CREATED"
  | "PROFILE_COMPLETED"
  | "USERS_INVITED"
  | "DATA_IMPORTED"
  | "COMPLETED";

export interface CompanyProfileData {
  companyLegalName?: string;
  industry?: string;
  website?: string;
  supportEmail?: string;
  gstin?: string;
  pan?: string;
}

export interface InviteUserData {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  stepsCompleted: OnboardingStep[];
}
