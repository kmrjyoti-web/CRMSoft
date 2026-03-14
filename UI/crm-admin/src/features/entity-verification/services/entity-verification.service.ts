import api from "@/services/api-client";
import type {
  InitiateVerificationDto,
  VerifyOtpDto,
  InitiateResult,
  VerificationRecord,
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

  getHistory: (entityType: string, entityId: string) =>
    api.get<unknown>(`${BASE}/history/${entityType}/${entityId}`).then((r) => unwrap<VerificationRecord[]>(r)),

  getStatus: (entityType: string, entityId: string) =>
    api.get<unknown>(`${BASE}/status/${entityType}/${entityId}`).then((r) => unwrap<unknown>(r)),

  getPending: () =>
    api.get<unknown>(`${BASE}/pending`).then((r) => unwrap<VerificationRecord[]>(r)),
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
