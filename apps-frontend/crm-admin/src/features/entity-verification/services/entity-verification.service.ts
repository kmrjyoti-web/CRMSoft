import api from "@/services/api-client";
import type {
  InitiateVerificationDto,
  VerifyOtpDto,
  InitiateResult,
  VerificationRecord,
  VerificationReportSummary,
  VerificationReportListResponse,
  VerificationTrendResponse,
  VerificationReportFilters,
} from "../types/entity-verification.types";

const BASE = "/api/v1/entity-verification";

function unwrap<T>(res: unknown): T {
  const r = res as { data?: { data?: T } | T };
  if (r?.data && typeof r.data === "object" && "data" in (r.data as object)) {
    return (r.data as { data: T }).data;
  }
  return (r?.data ?? r) as T;
}

export const entityVerificationService = {
  initiate: (dto: InitiateVerificationDto) =>
    api.post<unknown>(BASE + "/initiate", dto).then((r) => unwrap<InitiateResult>(r)),

  verifyOtp: (dto: VerifyOtpDto) =>
    api.post<unknown>(BASE + "/verify-otp", dto).then((r) => unwrap<unknown>(r)),

  resend: (recordId: string) =>
    api.post<unknown>(`${BASE}/resend/${recordId}`).then((r) => unwrap<InitiateResult>(r)),

  resetVerification: (entityType: string, entityId: string) =>
    api.post<unknown>(`${BASE}/reset/${entityType}/${entityId}`).then((r) => unwrap<unknown>(r)),

  getHistory: (entityType: string, entityId: string) =>
    api.get<unknown>(`${BASE}/history/${entityType}/${entityId}`).then((r) => unwrap<VerificationRecord[]>(r)),

  getStatus: (entityType: string, entityId: string) =>
    api.get<unknown>(`${BASE}/status/${entityType}/${entityId}`).then((r) => unwrap<unknown>(r)),

  getPending: () =>
    api.get<unknown>(`${BASE}/pending`).then((r) => unwrap<VerificationRecord[]>(r)),

  // ── Report endpoints ────────────────────────────────────

  getReportSummary: (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const qs = params.toString();
    return api.get<unknown>(`${BASE}/report/summary${qs ? `?${qs}` : ""}`).then((r) => unwrap<VerificationReportSummary>(r));
  },

  getReportList: (filters: VerificationReportFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.channel) params.set("channel", filters.channel);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<unknown>(`${BASE}/report/list${qs ? `?${qs}` : ""}`).then((r) => unwrap<VerificationReportListResponse>(r));
  },

  getExpiredLinks: () =>
    api.get<unknown>(`${BASE}/report/expired-links`).then((r) => unwrap<VerificationRecord[]>(r)),

  getVerificationTrend: (days = 30) =>
    api.get<unknown>(`${BASE}/report/trend?days=${days}`).then((r) => unwrap<VerificationTrendResponse>(r)),

  getExportUrl: (filters?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    const qs = params.toString();
    return `${BASE}/report/export${qs ? `?${qs}` : ""}`;
  },
};

// Public endpoints (no auth)
const PUBLIC_BASE = "/api/v1/public/entity-verify";

export const publicVerificationService = {
  getPage: async (token: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}${PUBLIC_BASE}/${token}`
    );
    const json = await res.json();
    return json?.data ?? json;
  },
  confirm: async (token: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}${PUBLIC_BASE}/${token}/confirm`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );
    return res.json();
  },
  reject: async (token: string, reason: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}${PUBLIC_BASE}/${token}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }
    );
    return res.json();
  },
};
