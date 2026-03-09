import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  VerificationStatus,
  VerificationResult,
  CanPerformResult,
  SendEmailOtpDto,
  VerifyEmailOtpDto,
  SendMobileOtpDto,
  VerifyMobileOtpDto,
  SubmitGstDto,
} from "../types/verification.types";

const BASE = "/verification";

export function getVerificationStatus() {
  return apiClient.get<ApiResponse<VerificationStatus>>(`${BASE}/status`).then((r) => r.data);
}

export function sendEmailOtp(dto?: SendEmailOtpDto) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/email/send`, dto).then((r) => r.data);
}

export function verifyEmailOtp(dto: VerifyEmailOtpDto) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/email/verify`, dto).then((r) => r.data);
}

export function sendMobileOtp(dto?: SendMobileOtpDto) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/mobile/send`, dto).then((r) => r.data);
}

export function verifyMobileOtp(dto: VerifyMobileOtpDto) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/mobile/verify`, dto).then((r) => r.data);
}

export function submitGst(dto: SubmitGstDto) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/gst/submit`, dto).then((r) => r.data);
}

export function approveGst(userId: string) {
  return apiClient.post<ApiResponse<VerificationResult>>(`${BASE}/gst/approve/${userId}`).then((r) => r.data);
}

export function canPerform(action: string) {
  return apiClient.get<ApiResponse<CanPerformResult>>(`${BASE}/can-perform/${action}`).then((r) => r.data);
}
