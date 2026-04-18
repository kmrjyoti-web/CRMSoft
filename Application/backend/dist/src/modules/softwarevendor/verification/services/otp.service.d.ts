import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '@prisma/identity-client';
interface SendOtpParams {
    target: string;
    targetType: 'EMAIL' | 'MOBILE';
    purpose: OtpPurpose;
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
}
interface VerifyOtpParams {
    target: string;
    targetType: 'EMAIL' | 'MOBILE';
    purpose: OtpPurpose;
    otp: string;
    userId?: string;
}
export declare class OtpService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly OTP_LENGTH;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly MAX_ATTEMPTS;
    private readonly RESEND_COOLDOWN_SECONDS;
    constructor(prisma: PrismaService, config: ConfigService);
    sendOtp(params: SendOtpParams): Promise<{
        success: boolean;
        message: string;
        expiresAt: Date;
    }>;
    verifyOtp(params: VerifyOtpParams): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateOtp;
    private hashOtp;
    private maskTarget;
    private sendEmailOtp;
    private sendSmsOtp;
}
export {};
