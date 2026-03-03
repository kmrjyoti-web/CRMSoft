import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";

import { setAuthCookie, clearAuthCookie } from "@/features/auth/utils/auth-cookies";
import { useAuthStore } from "@/stores/auth.store";

const isDev = process.env.NODE_ENV === "development";

// ── Axios Instance ──────────────────────────────────────

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token, tenantId } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }

  if (isDev) {
    console.log(
      `[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.params ?? "",
    );
  }

  return config;
});

// ── Response Interceptor ────────────────────────────────

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  for (const p of pendingQueue) {
    if (token) p.resolve(token);
    else p.reject(error);
  }
  pendingQueue = [];
}

/** Extract a user-friendly message from an error response */
function getErrorMessage(error: AxiosError): string {
  const data = error.response?.data as Record<string, unknown> | undefined;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.error && typeof data.error === "string") return data.error;
  return error.message || "Something went wrong";
}

api.interceptors.response.use(
  // ── Success ───────────────────────────────────────────
  (response: AxiosResponse) => {
    // The backend NestJS ResponseMapperInterceptor re-wraps responses that the
    // controller already wrapped manually with ApiResponse.success().
    // Result shape: { success, statusCode, data: { success, message, data: actual } }
    // Detect and flatten the double-wrap so consumers always get one level:
    // { success, statusCode, data: actual }
    const body = response.data;
    if (
      body &&
      typeof body.success === 'boolean' &&
      body.data &&
      typeof body.data.success === 'boolean' &&
      'data' in body.data
    ) {
      response.data = {
        ...body,
        data: body.data.data,
        meta: body.data.meta ?? body.meta,
        message: body.data.message ?? body.message,
      };
    }

    if (isDev) {
      console.log(
        `[API] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },

  // ── Error ─────────────────────────────────────────────
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (isDev) {
      console.error(
        `[API] ✗ ${status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        error.response?.data ?? error.message,
      );
    }

    // ── 401 Unauthorized → try refresh → fail → logout ──
    if (status === 401 && !originalRequest._retry) {
      const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

      // No refresh token → clear auth immediately
      if (!refreshToken) {
        clearAuth();
        clearAuthCookie();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      // Try to refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: wrapper } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          { refreshToken },
        );

        // Unwrap NestJS ResponseMapperInterceptor: { data: { accessToken, ... } }
        const refreshData = wrapper.data ?? wrapper;

        setAuth({
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken ?? refreshToken,
        });

        setAuthCookie(refreshData.accessToken);
        processQueue(null, refreshData.accessToken);

        originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        clearAuthCookie();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 Forbidden → toast "Access Denied" ───────────
    if (status === 403) {
      toast.error("Access Denied — you don't have permission for this action.");
    }

    // ── 500 Server Error → toast error message ──────────
    if (status && status >= 500) {
      toast.error(getErrorMessage(error));
    }

    return Promise.reject(error);
  },
);

export default api;
