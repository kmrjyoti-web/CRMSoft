import type { ApiResponse } from "@/types/api-response";
import type { LookupValue } from "@/types/lookup";

import api from "./api-client";

// ── Lookup Service ─────────────────────────────────────

export const lookupService = {
  /** GET /api/v1/lookups/values/:category */
  async getValues(masterCode: string): Promise<LookupValue[]> {
    const { data } = await api.get<ApiResponse<LookupValue[]>>(
      `/api/v1/lookups/values/${masterCode}`,
    );
    const result = data.data;
    // Backend returns { lookupId, category, displayName, values }
    return Array.isArray(result) ? result : (result as any)?.values ?? [];
  },
};

export default lookupService;
