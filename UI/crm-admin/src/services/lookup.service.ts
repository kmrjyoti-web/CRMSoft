import type { ApiResponse } from "@/types/api-response";
import type { LookupValue } from "@/types/lookup";

import api from "./api-client";

// ── Lookup Service ─────────────────────────────────────

export const lookupService = {
  /** GET /api/v1/lookups/values?masterCode=CATEGORY */
  async getValues(masterCode: string): Promise<LookupValue[]> {
    const { data } = await api.get<ApiResponse<LookupValue[]>>(
      "/api/v1/lookups/values",
      { params: { masterCode } },
    );
    return data.data;
  },
};

export default lookupService;
