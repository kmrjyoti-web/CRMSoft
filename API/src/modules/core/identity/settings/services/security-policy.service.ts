import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SecurityPolicy, IpAccessRule, IpRuleType } from '@prisma/identity-client';
import { AppError } from '../../../../../common/errors/app-error';

@Injectable()
export class SecurityPolicyService {
  private readonly logger = new Logger(SecurityPolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get full security policy for a tenant (with IP rules). */
  async get(tenantId: string): Promise<SecurityPolicy & { ipRules: IpAccessRule[] }> {
    const policy = await this.prisma.securityPolicy.findUnique({
      where: { tenantId },
      include: { ipRules: { where: { isActive: true } } },
    });
    if (!policy) throw AppError.from('CONFIG_ERROR');
    return policy;
  }

  /** Update security policy settings. */
  async update(tenantId: string, data: Partial<SecurityPolicy>, userId?: string): Promise<SecurityPolicy> {
    return this.prisma.securityPolicy.upsert({
      where: { tenantId },
      update: { ...data, updatedById: userId },
      create: { tenantId, ...data, updatedById: userId } as any,
    });
  }

  /** Add an IP whitelist/blacklist rule. */
  async addIpRule(tenantId: string, rule: {
    ruleType: IpRuleType; ipAddress: string; description?: string;
  }): Promise<IpAccessRule> {
    const policy = await this.ensurePolicy(tenantId);
    return this.prisma.ipAccessRule.create({
      data: { securityPolicyId: policy.id, ...rule },
    });
  }

  /** Remove an IP rule. */
  async removeIpRule(ruleId: string): Promise<void> {
    await this.prisma.ipAccessRule.update({
      where: { id: ruleId },
      data: { isActive: false },
    });
  }

  /** List all IP rules for a tenant. */
  async listIpRules(tenantId: string): Promise<IpAccessRule[]> {
    const policy = await this.prisma.securityPolicy.findUnique({ where: { tenantId } });
    if (!policy) return [];
    return this.prisma.ipAccessRule.findMany({
      where: { securityPolicyId: policy.id, isActive: true },
    });
  }

  /** Validate a password against tenant's password policy. */
  async validatePassword(tenantId: string, password: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = await this.prisma.securityPolicy.findUnique({ where: { tenantId } });
    if (!policy) return { valid: true, errors: [] };
    const errors: string[] = [];

    if (password.length < policy.passwordMinLength) {
      errors.push(`Minimum ${policy.passwordMinLength} characters required`);
    }
    if (password.length > policy.passwordMaxLength) {
      errors.push(`Maximum ${policy.passwordMaxLength} characters allowed`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (policy.requireLowercase && !/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (policy.requireNumbers && !/\d/.test(password)) errors.push('Must contain a number');
    if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) errors.push('Must contain special character');

    return { valid: errors.length === 0, errors };
  }

  /** Check if an IP is allowed based on tenant IP rules. */
  async isIpAllowed(tenantId: string, ip: string): Promise<boolean> {
    const policy = await this.prisma.securityPolicy.findUnique({
      where: { tenantId },
      include: { ipRules: { where: { isActive: true } } },
    });
    if (!policy?.ipRestrictionEnabled || !policy.ipRules.length) return true;

    const whitelist = policy.ipRules.filter((r) => r.ruleType === 'WHITELIST');
    const blacklist = policy.ipRules.filter((r) => r.ruleType === 'BLACKLIST');

    if (blacklist.some((r) => this.ipMatches(ip, r.ipAddress))) return false;
    if (whitelist.length > 0) return whitelist.some((r) => this.ipMatches(ip, r.ipAddress));
    return true;
  }

  private ipMatches(ip: string, rule: string): boolean {
    if (!rule.includes('/')) return ip === rule;
    const [network, bits] = rule.split('/');
    const mask = ~((1 << (32 - Number(bits))) - 1);
    const ipNum = this.ipToNum(ip);
    const netNum = this.ipToNum(network);
    return (ipNum & mask) === (netNum & mask);
  }

  private ipToNum(ip: string): number {
    return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0);
  }

  private async ensurePolicy(tenantId: string): Promise<SecurityPolicy> {
    return this.prisma.securityPolicy.upsert({
      where: { tenantId },
      update: {},
      create: { tenantId },
    });
  }
}
