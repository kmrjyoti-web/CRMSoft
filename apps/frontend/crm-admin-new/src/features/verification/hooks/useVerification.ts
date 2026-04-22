import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/verification.service";
import type {
  SendEmailOtpDto,
  VerifyEmailOtpDto,
  SendMobileOtpDto,
  VerifyMobileOtpDto,
  SubmitGstDto,
} from "../types/verification.types";

const KEY = "verification-status";

export function useVerificationStatus() {
  return useQuery({ queryKey: [KEY], queryFn: svc.getVerificationStatus });
}

export function useSendEmailOtp() {
  return useMutation({ mutationFn: (dto?: SendEmailOtpDto) => svc.sendEmailOtp(dto) });
}

export function useVerifyEmailOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyEmailOtpDto) => svc.verifyEmailOtp(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSendMobileOtp() {
  return useMutation({ mutationFn: (dto?: SendMobileOtpDto) => svc.sendMobileOtp(dto) });
}

export function useVerifyMobileOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyMobileOtpDto) => svc.verifyMobileOtp(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSubmitGst() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitGstDto) => svc.submitGst(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useApproveGst() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => svc.approveGst(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCanPerform(action: string) {
  return useQuery({
    queryKey: ["can-perform", action],
    queryFn: () => svc.canPerform(action),
    enabled: !!action,
  });
}
