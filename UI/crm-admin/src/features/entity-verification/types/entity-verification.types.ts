export type EntityVerificationMode = "OTP" | "LINK";
export type EntityVerificationChannel = "EMAIL" | "MOBILE_SMS" | "WHATSAPP";
export type EntityVerificationStatus = "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED" | "REJECTED";
export type EntityVerifStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface InitiateVerificationDto {
  entityType: string;
  entityId: string;
  mode: EntityVerificationMode;
  channel: EntityVerificationChannel;
}

export interface VerifyOtpDto {
  recordId: string;
  otp: string;
}

export interface VerificationRecord {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string | null;
  mode: EntityVerificationMode;
  channel: EntityVerificationChannel;
  status: EntityVerificationStatus;
  sentToEmail: string | null;
  sentToMobile: string | null;
  verifiedByUserName: string | null;
  verifiedAt: string | null;
  otpExpiresAt: string | null;
  linkExpiresAt: string | null;
  linkUrl: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface InitiateResult {
  recordId: string;
  channel: EntityVerificationChannel;
  sentTo: string | null;
  expiresIn: string;
  linkUrl?: string;
  expiresAt?: string;
  otpExpiresAt?: string;
  sentVia?: string[];
  devOtp?: string; // dev only
}

export interface VerificationPageData {
  alreadyVerified?: boolean;
  expired?: boolean;
  recordId?: string;
  entityType?: string;
  entityName?: string | null;
  details?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
    organization?: string | null;
  };
  expiresAt?: string;
}
