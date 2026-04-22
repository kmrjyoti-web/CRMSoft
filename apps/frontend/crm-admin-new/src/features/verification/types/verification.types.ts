// ---------------------------------------------------------------------------
// Verification Types
// ---------------------------------------------------------------------------

export interface VerificationStatus {
  userId: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  gstVerified: boolean;
  gstStatus?: "PENDING" | "APPROVED" | "REJECTED";
  gstNumber?: string;
  overallStatus: "UNVERIFIED" | "PARTIAL" | "VERIFIED";
}

export interface VerificationResult {
  success: boolean;
  message: string;
}

export interface CanPerformResult {
  allowed: boolean;
  reason?: string;
  requiredVerifications?: string[];
}

// DTOs
export interface SendEmailOtpDto {
  email?: string;
}

export interface VerifyEmailOtpDto {
  otp: string;
}

export interface SendMobileOtpDto {
  mobile?: string;
}

export interface VerifyMobileOtpDto {
  otp: string;
}

export interface SubmitGstDto {
  gstNumber: string;
  businessName: string;
  address?: string;
}
