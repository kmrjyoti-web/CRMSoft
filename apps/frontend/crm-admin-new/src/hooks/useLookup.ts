import { useQuery } from "@tanstack/react-query";

import { lookupService } from "@/services/lookup.service";
import type { LookupValue } from "@/types/lookup";

// ── Lookup Hook (TanStack Query with 30 min cache) ────

export function useLookup(category: string) {
  return useQuery<LookupValue[]>({
    queryKey: ["lookup", category],
    queryFn: () => lookupService.getValues(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!category,
  });
}
