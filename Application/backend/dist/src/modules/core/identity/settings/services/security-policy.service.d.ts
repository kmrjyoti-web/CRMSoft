import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SecurityPolicy, IpAccessRule, IpRuleType } from '@prisma/identity-client';
export declare class SecurityPolicyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    get(tenantId: string): Promise<SecurityPolicy & {
        ipRules: IpAccessRule[];
    }>;
    update(tenantId: string, data: Partial<SecurityPolicy>, userId?: string): Promise<SecurityPolicy>;
    addIpRule(tenantId: string, rule: {
        ruleType: IpRuleType;
        ipAddress: string;
        description?: string;
    }): Promise<IpAccessRule>;
    removeIpRule(ruleId: string): Promise<void>;
    listIpRules(tenantId: string): Promise<IpAccessRule[]>;
    validatePassword(tenantId: string, password: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    isIpAllowed(tenantId: string, ip: string): Promise<boolean>;
    private ipMatches;
    private ipToNum;
    private ensurePolicy;
}
