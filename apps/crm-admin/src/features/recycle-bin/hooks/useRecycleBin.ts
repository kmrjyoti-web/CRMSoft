import { useQuery } from "@tanstack/react-query";

import { recycleBinService } from "../services/recycle-bin.service";

import type { RecycleBinParams } from "../types/recycle-bin.types";

const KEY = "recycle-bin";

export function useRecycleBinList(params?: RecycleBinParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => recycleBinService.getAll(params),
  });
}
