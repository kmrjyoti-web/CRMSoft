import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { OnboardingStep, CompanyProfileData, InviteUserData } from "../types/onboarding.types";

export const onboardingService = {
  completeStep: (step: OnboardingStep) =>
    api
      .post<ApiResponse<any>>(`/api/v1/tenant/subscription/onboarding/${step}`)
      .then((r) => r.data),

  getSubscription: () =>
    api
      .get<ApiResponse<any>>("/api/v1/tenant/subscription")
      .then((r) => {
        const outer = r.data.data as any;
        return outer?.data ?? outer;
      }),

  updateProfile: (data: CompanyProfileData) =>
    api
      .put<ApiResponse<any>>("/api/v1/tenant/subscription/profile", data)
      .then((r) => r.data),

  inviteUser: (data: InviteUserData & { password: string }) =>
    api
      .post<ApiResponse<any>>("/api/v1/auth/staff/register", {
        ...data,
        userType: "EMPLOYEE",
      })
      .then((r) => r.data),
};
