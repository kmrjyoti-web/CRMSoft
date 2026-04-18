import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface ResolvedRule {
    value: any;
    level: string;
    pageOverrides?: Record<string, any>;
    valueType: string;
    label: string;
    category: string;
}
export interface RuleResolutionContext {
    userId?: string;
    roleIds?: string[];
    pageCode?: string;
    industryCode?: string;
}
export declare class RuleResolverService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    resolveRule(tenantId: string, ruleCode: string, context?: RuleResolutionContext): Promise<ResolvedRule | null>;
    resolveAllRules(tenantId: string, userId: string, roleIds: string[], industryCode?: string): Promise<Record<string, ResolvedRule>>;
    getCacheVersion(tenantId: string): Promise<{
        version: number;
        lastChangedAt: Date;
    }>;
    incrementCacheVersion(tenantId: string, userId: string): Promise<number>;
    private pickWinner;
    private getLevelPriority;
    private parseValue;
}
