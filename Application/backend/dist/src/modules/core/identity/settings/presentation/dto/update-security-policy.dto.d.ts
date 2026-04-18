import { IpRuleType } from '@prisma/identity-client';
export declare class UpdateSecurityPolicyDto {
    passwordMinLength?: number;
    passwordMaxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    passwordExpiryDays?: number;
    preventReuseCount?: number;
    maxLoginAttempts?: number;
    lockoutDurationMinutes?: number;
    requireCaptchaAfter?: number;
    sessionTimeoutMinutes?: number;
    maxConcurrentSessions?: number;
    singleSessionPerUser?: boolean;
    sessionExtendOnActivity?: boolean;
    twoFactorEnabled?: boolean;
    twoFactorMethod?: string;
    twoFactorGracePeriodDays?: number;
    ipRestrictionEnabled?: boolean;
    enforceAuditLog?: boolean;
    logLoginAttempts?: boolean;
    logDataExports?: boolean;
    apiAccessEnabled?: boolean;
    apiRateLimitPerMinute?: number;
}
export declare class CreateIpRuleDto {
    ruleType: IpRuleType;
    ipAddress: string;
    description?: string;
}
