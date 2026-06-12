export type IpRuleType = 'WHITELIST' | 'BLACKLIST';

export interface IpAccessRule {
  id: string;
  securityPolicyId: string;
  ruleType: IpRuleType;
  ipAddress: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SecurityPolicy {
  id: string;
  tenantId: string;
  ipRestrictionEnabled: boolean;
  passwordMinLength: number;
  passwordMaxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  twoFactorEnabled: boolean;
  ipRules: IpAccessRule[];
}

export interface CreateIpRuleDto {
  ruleType: IpRuleType;
  ipAddress: string;
  description?: string;
}
