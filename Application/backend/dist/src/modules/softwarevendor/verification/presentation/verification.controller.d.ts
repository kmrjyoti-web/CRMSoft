import { VerificationService } from '../services/verification.service';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    getStatus(userId: string): Promise<import("../services/verification.service").UserVerificationInfo>;
    sendEmailOtp(userId: string, req: any): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
    }>;
    verifyEmail(userId: string, body: {
        otp: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendMobileOtp(userId: string, req: any): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
    }>;
    verifyMobile(userId: string, body: {
        otp: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    submitGst(userId: string, body: {
        gstNumber: string;
        companyName: string;
        businessType?: string;
    }): Promise<{
        success: boolean;
        message: string;
        verificationMethod: string;
    }>;
    approveGst(approvedById: string, userId: string, body: {
        notes?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    canPerformAction(userId: string, action: string): Promise<{
        action: string;
        canPerform: boolean;
    }>;
}
