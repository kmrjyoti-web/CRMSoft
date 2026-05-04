import type { ApiResponse } from "@/types/api-response";

import api from "./api-client";

// ── Permission Service ─────────────────────────────────

/** Unwrap potentially double-wrapped API response */
function unwrapArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: string[] }).data ?? [];
  }
  return [];
}

export const permissionService = {
  /** GET /api/v1/auth/permissions — flat array of "module:action" codes */
  async getMyPermissions(): Promise<string[]> {
    const { data } = await api.get<ApiResponse<string[]>>(
      "/api/v1/auth/permissions",
    );
    return unwrapArray(data.data);
  },
};

export default permissionService;
