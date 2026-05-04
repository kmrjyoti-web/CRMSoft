"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { controlRoomService } from "../services/control-room.service";
import type { UpdateRulePayload } from "../types/control-room.types";

const KEY = "control-room";

export function useControlRoomRules() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => controlRoomService.getRulesGrouped(),
  });
}

export function useUpdateControlRoomRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleCode, data }: { ruleCode: string; data: UpdateRulePayload }) =>
      controlRoomService.updateRule(ruleCode, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useResetControlRoomRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleCode, level }: { ruleCode: string; level: string }) =>
      controlRoomService.resetRule(ruleCode, level),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useControlRoomAudit(ruleCode?: string) {
  return useQuery({
    queryKey: [KEY, "audit", ruleCode],
    queryFn: () => controlRoomService.getAuditTrail(ruleCode),
    enabled: !!ruleCode,
  });
}

// Draft mode hooks
export function useSaveControlRoomDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleCode, data }: { ruleCode: string; data: UpdateRulePayload }) =>
      controlRoomService.saveDraft(ruleCode, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, "drafts"] });
    },
  });
}

export function usePendingDrafts() {
  return useQuery({
    queryKey: [KEY, "drafts"],
    queryFn: () => controlRoomService.getPendingDrafts(),
  });
}

export function useDiscardDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => controlRoomService.discardDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, "drafts"] });
    },
  });
}

export function useDiscardAllDrafts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => controlRoomService.discardAllDrafts(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, "drafts"] });
    },
  });
}

export function useApplyAllDrafts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changeReason: string) => controlRoomService.applyAllDrafts(changeReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, "drafts"] });
    },
  });
}
