"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entityVerificationService } from "../services/entity-verification.service";
import type {
  InitiateVerificationDto,
  VerifyOtpDto,
} from "../types/entity-verification.types";

export function useVerificationHistory(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["entity-verification-history", entityType, entityId],
    queryFn: () => entityVerificationService.getHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useVerificationStatus(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["entity-verification-status", entityType, entityId],
    queryFn: () => entityVerificationService.getStatus(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function usePendingVerifications() {
  return useQuery({
    queryKey: ["entity-verification-pending"],
    queryFn: () => entityVerificationService.getPending(),
  });
}

export function useInitiateVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: InitiateVerificationDto) =>
      entityVerificationService.initiate(dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["entity-verification-status", vars.entityType, vars.entityId],
      });
      qc.invalidateQueries({
        queryKey: ["entity-verification-history", vars.entityType, vars.entityId],
      });
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (dto: VerifyOtpDto) => entityVerificationService.verifyOtp(dto),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (recordId: string) => entityVerificationService.resend(recordId),
  });
}
