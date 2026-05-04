import type {
  User,
  LoginRequest,
  LoginResponse,
  CompanyListItem,
  SwitchCompanyResult,
} from "@/features/auth/types/auth.types";
import { setAuthCookie, clearAuthCookie } from "@/features/auth/utils/auth-cookies";
import api from "@/services/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api-response";

// ── Auth Service ────────────────────────────────────────

export const authService = {
  /**
   * POST /api/v1/auth/login  (universal — backend resolves user type via DB)
   *
   * Brand-wise deployments (Travvellis, Software, Electronic) must NOT hardcode
   * a portal/userType. The backend reads User+Company+Mapping and decides.
   *
   * @deprecated second arg `_portal` is accepted but ignored — will be removed next sprint
   */
  async login(
    payload: LoginRequest,
    _portal?: string,
  ): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      `/api/v1/auth/login`,
      payload,
    );

    // Unwrap the NestJS ResponseMapperInterceptor wrapper.
    // The auth controller returns { success, message, data: { user, accessToken, ... } }
    // which gets wrapped again by the interceptor as { data: { ... } }.
    const outerData = data.data as LoginResponse & { data?: LoginResponse };
    const loginData: LoginResponse = outerData.data ?? outerData;

    useAuthStore.getState().setAuth(loginData);
    setAuthCookie(loginData.accessToken);
    return loginData;
  },

  /** Clear store + redirect to /login */
  logout(): void {
    clearAuthCookie();
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  /** POST /api/v1/auth/refresh */
  async refreshToken(): Promise<LoginResponse> {
    const { refreshToken } = useAuthStore.getState();

    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/api/v1/auth/refresh",
      { refreshToken },
    );

    // Unwrap the NestJS wrapper (handles double-wrapping)
    const outerData = data.data as LoginResponse & { data?: LoginResponse };
    const refreshData: LoginResponse = outerData.data ?? outerData;

    useAuthStore.getState().setAuth({
      accessToken: refreshData.accessToken,
      refreshToken: refreshData.refreshToken ?? refreshToken ?? "",
    });
    setAuthCookie(refreshData.accessToken);

    return refreshData;
  },

  // ── Company management ──────────────────────────────────

  /** GET /api/v1/auth/me/companies — list all companies the user belongs to */
  async getMyCompanies(): Promise<CompanyListItem[]> {
    const { data } = await api.get<ApiResponse<CompanyListItem[]>>(
      "/api/v1/auth/me/companies",
    );
    return (data as any).data ?? [];
  },

  /** POST /api/v1/auth/select-company — initial company selection after login */
  async selectCompany(companyId: string): Promise<SwitchCompanyResult> {
    const { data } = await api.post<ApiResponse<SwitchCompanyResult>>(
      "/api/v1/auth/select-company",
      { companyId },
    );
    return (data as any).data;
  },

  /** POST /api/v1/auth/switch-company — switch active company within session */
  async switchCompany(companyId: string): Promise<SwitchCompanyResult> {
    const { data } = await api.post<ApiResponse<SwitchCompanyResult>>(
      "/api/v1/auth/switch-company",
      { companyId },
    );
    return (data as any).data;
  },

  /** GET /api/v1/auth/me */
  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/api/v1/auth/me");

    // Unwrap the NestJS wrapper
    const user = data.data;

    useAuthStore.getState().setUser(user);
    return user;
  },
};

export default authService;
