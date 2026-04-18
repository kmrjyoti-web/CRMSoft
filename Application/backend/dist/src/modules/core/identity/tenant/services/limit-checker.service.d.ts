import { PrismaService } from '../../../../../core/prisma/prisma.service';
export type LimitResource = string;
export interface ResourceCheckResult {
    allowed: boolean;
    current: number;
    limit: number;
    limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';
    isChargeable: boolean;
    chargeTokens: number;
}
export declare class LimitCheckerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkResource(tenantId: string, resourceKey: string): Promise<ResourceCheckResult>;
    canCreate(tenantId: string, resource: LimitResource): Promise<{
        allowed: boolean;
        current: number;
        limit: number;
    }>;
    hasFeature(tenantId: string, feature: string): Promise<boolean>;
    getAllLimitsWithUsage(tenantId: string): Promise<{
        planName: string;
        limits: Array<ResourceCheckResult & {
            resourceKey: string;
        }>;
    }>;
}
