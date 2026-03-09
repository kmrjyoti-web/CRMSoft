import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  RegisterRequest,
  RegisterResponse,
  PlanOption,
} from "../types/registration.types";

export const registrationService = {
  register: (data: RegisterRequest) =>
    api
      .post<ApiResponse<RegisterResponse>>("/api/v1/auth/tenant/register", data)
      .then((r) => {
        const outer = r.data.data as RegisterResponse & { data?: RegisterResponse };
        return outer.data ?? outer;
      }),

  checkSlug: (slug: string) =>
    api
      .get<ApiResponse<{ available: boolean }>>(`/api/v1/auth/tenant/check-slug/${slug}`)
      .then((r) => {
        const outer = r.data.data as { available: boolean } & { data?: { available: boolean } };
        return (outer as any).data ?? outer;
      }),

  getPlans: () =>
    api
      .get<ApiResponse<PlanOption[]>>("/api/v1/tenant/subscription/plans")
      .then((r) => {
        const outer = r.data.data as PlanOption[] & { data?: PlanOption[] };
        return (outer as any).data ?? outer;
      }),
};
