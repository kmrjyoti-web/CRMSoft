import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type { RecycleBinItem, RecycleBinParams } from "../types/recycle-bin.types";

const BASE_URL = "/recycle-bin";

export const recycleBinService = {
  getAll: (params?: RecycleBinParams) =>
    apiClient
      .get<ApiResponse<RecycleBinItem[]>>(BASE_URL, { params })
      .then((r) => r.data),
};
