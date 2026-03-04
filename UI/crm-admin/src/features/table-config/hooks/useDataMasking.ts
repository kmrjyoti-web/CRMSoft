"use client";

import { useMemo, useCallback } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { dataMaskingService } from "../services/data-masking.service";

import type {
  MaskingPolicy,
  CreateMaskingPolicyData,
  UpdateMaskingPolicyData,
} from "../types/table-config.types";

const KEY = "data-masking";

interface MaskingRule {
  columnId: string;
  maskType: "FULL" | "PARTIAL";
  canUnmask: boolean;
}

const EMPTY_RULES: MaskingRule[] = [];

/**
 * Extract rules array from the API response, handling various wrapper formats.
 */
function extractRules(raw: unknown): MaskingRule[] {
  if (!raw) return EMPTY_RULES;

  // Direct array (already fully unwrapped)
  if (Array.isArray(raw)) return raw;

  // { data: [...] } — one level of wrapping
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data;

  // { data: { data: [...] } } — double wrapped
  const inner = obj.data as Record<string, unknown> | undefined;
  if (inner && Array.isArray(inner.data)) return inner.data;

  return EMPTY_RULES;
}

/**
 * Hook for consuming masking rules on a specific table (list pages).
 * Pass `undefined` to disable (no API call).
 */
export function useDataMasking(tableKey: string | undefined) {
  const qc = useQueryClient();
  const enabled = !!tableKey;

  const { data, error } = useQuery({
    queryKey: [KEY, "rules", tableKey],
    queryFn: () => dataMaskingService.getRules(tableKey!),
    staleTime: 30 * 1000,          // 30s — refresh quickly when rules change
    refetchOnMount: "always",      // always refetch when a list page mounts
    retry: 1,                      // retry once on failure
    enabled,
  });

  if (error && process.env.NODE_ENV === "development") {
    console.warn(`[useDataMasking] Failed to fetch rules for "${tableKey}":`, error);
  }

  const rules = useMemo(() => {
    if (!enabled) return EMPTY_RULES;
    const extracted = extractRules(data);
    if (process.env.NODE_ENV === "development" && extracted.length > 0) {
      console.log(`[useDataMasking] Rules for "${tableKey}":`, extracted);
    }
    return extracted;
  }, [enabled, data, tableKey]);

  const isMasked = useCallback(
    (columnId: string) => rules.some((r) => r.columnId === columnId),
    [rules],
  );

  const canUnmask = useCallback(
    (columnId: string) =>
      rules.find((r) => r.columnId === columnId)?.canUnmask ?? false,
    [rules],
  );

  const unmaskMutation = useMutation({
    mutationFn: (params: { recordId: string; columnId: string }) =>
      dataMaskingService.unmask({ tableKey: tableKey!, ...params }),
  });

  const unmask = useCallback(
    async (recordId: string, columnId: string) => {
      const result = await unmaskMutation.mutateAsync({ recordId, columnId });
      return result?.data?.value ?? null;
    },
    [unmaskMutation],
  );

  return { rules, isMasked, canUnmask, unmask };
}

/**
 * Hook for admin masking policy management.
 */
export function useMaskingPolicies(tableKey?: string) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [KEY, "policies", tableKey],
    queryFn: () => dataMaskingService.listPolicies(tableKey),
  });

  const policies: MaskingPolicy[] = useMemo(() => {
    const resp = data?.data;
    if (Array.isArray(resp)) return resp;
    // Handle direct array
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaskingPolicyData) =>
      dataMaskingService.createPolicy(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaskingPolicyData }) =>
      dataMaskingService.updatePolicy(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataMaskingService.deletePolicy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    policies,
    isLoading,
    createPolicy: createMutation.mutateAsync,
    updatePolicy: updateMutation.mutateAsync,
    deletePolicy: deleteMutation.mutateAsync,
  };
}
