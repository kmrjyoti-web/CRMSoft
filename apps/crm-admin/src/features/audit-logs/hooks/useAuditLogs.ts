import { useQuery } from "@tanstack/react-query";

import { auditService } from "../services/audit.service";

import type { AuditQueryParams, AuditSearchParams } from "../types/audit.types";

const KEY = "audit-logs";

export function useAuditFeed(params?: AuditQueryParams) {
  return useQuery({
    queryKey: [KEY, "feed", params],
    queryFn: () => auditService.getFeed(params),
  });
}

export function useAuditDetail(id: string | null) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => auditService.getById(id!),
    enabled: !!id,
  });
}

export function useAuditDiff(id: string | null) {
  return useQuery({
    queryKey: [KEY, "diff", id],
    queryFn: () => auditService.getDiff(id!),
    enabled: !!id,
  });
}

export function useAuditSearch(params?: AuditSearchParams) {
  return useQuery({
    queryKey: [KEY, "search", params],
    queryFn: () => auditService.search(params),
    enabled: !!params?.q,
  });
}

export function useAuditStats(params?: Pick<AuditQueryParams, "dateFrom" | "dateTo">) {
  return useQuery({
    queryKey: [KEY, "stats", params],
    queryFn: () => auditService.getStats(params),
  });
}
