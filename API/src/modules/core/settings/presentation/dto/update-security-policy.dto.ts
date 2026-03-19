import {
  IsOptional, IsInt, IsBoolean, IsString, Min, Max, IsEnum,
} from 'class-validator';
import { IpRuleType } from '@prisma/client';

export class UpdateSecurityPolicyDto {
  @IsOptional() @IsInt() @Min(6) @Max(128) passwordMinLength?: number;
  @IsOptional() @IsInt() @Min(8) @Max(256) passwordMaxLength?: number;
  @IsOptional() @IsBoolean() requireUppercase?: boolean;
  @IsOptional() @IsBoolean() requireLowercase?: boolean;
  @IsOptional() @IsBoolean() requireNumbers?: boolean;
  @IsOptional() @IsBoolean() requireSpecialChars?: boolean;
  @IsOptional() @IsInt() @Min(0) passwordExpiryDays?: number;
  @IsOptional() @IsInt() @Min(0) preventReuseCount?: number;
  @IsOptional() @IsInt() @Min(3) @Max(20) maxLoginAttempts?: number;
  @IsOptional() @IsInt() @Min(5) lockoutDurationMinutes?: number;
  @IsOptional() @IsInt() @Min(1) requireCaptchaAfter?: number;
  @IsOptional() @IsInt() @Min(5) sessionTimeoutMinutes?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) maxConcurrentSessions?: number;
  @IsOptional() @IsBoolean() singleSessionPerUser?: boolean;
  @IsOptional() @IsBoolean() sessionExtendOnActivity?: boolean;
  @IsOptional() @IsBoolean() twoFactorEnabled?: boolean;
  @IsOptional() @IsString() twoFactorMethod?: string;
  @IsOptional() @IsInt() @Min(0) twoFactorGracePeriodDays?: number;
  @IsOptional() @IsBoolean() ipRestrictionEnabled?: boolean;
  @IsOptional() @IsBoolean() enforceAuditLog?: boolean;
  @IsOptional() @IsBoolean() logLoginAttempts?: boolean;
  @IsOptional() @IsBoolean() logDataExports?: boolean;
  @IsOptional() @IsBoolean() apiAccessEnabled?: boolean;
  @IsOptional() @IsInt() @Min(10) apiRateLimitPerMinute?: number;
}

export class CreateIpRuleDto {
  @IsEnum(IpRuleType) ruleType: IpRuleType;
  @IsString() ipAddress: string;
  @IsOptional() @IsString() description?: string;
}
