import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OtpService } from './otp.service';
import { VerificationStatus, RegistrationType } from '@prisma/identity-client';
export interface UserVerificationInfo {
    userId: string;
    email: string;
    phone: string;
    verificationStatus: VerificationStatus;
    emailVerified: boolean;
    mobileVerified: boolean;
    registrationType: RegistrationType;
    gstVerified: boolean;
    canSeeB2BPricing: boolean;
    allowedActions: string[];
}
export declare class VerificationService {
    private readonly prisma;
    private readonly otpService;
    private readonly logger;
    constructor(prisma: PrismaService, otpService: OtpService);
    sendEmailVerification(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
    }>;
    verifyEmail(userId: string, otp: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendMobileVerification(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
    }>;
    verifyMobile(userId: string, otp: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitGstForVerification(userId: string, gstNumber: string, companyName: string, businessType?: string): Promise<{
        success: boolean;
        message: string;
        verificationMethod: string;
    }>;
    private verifyGstViaApi;
    approveGstManually(userId: string, approvedById: string, notes?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getVerificationStatus(userId: string): Promise<UserVerificationInfo>;
    canPerformAction(userId: string, action: string): Promise<boolean>;
    requireVerification(userId: string, action: string): Promise<void>;
    private getUser;
    private calculateVerificationStatus;
    private getAllowedActions;
}
