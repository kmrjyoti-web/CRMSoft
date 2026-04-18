import { PrismaService } from '../../../../../core/prisma/prisma.service';
export interface UpsertPlanLimitItem {
    resourceKey: string;
    limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';
    limitValue: number;
    isChargeable?: boolean;
    chargeTokens?: number;
}
export declare class PlanLimitService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getByPlan(planId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    }[]>;
    upsertLimits(planId: string, limits: UpsertPlanLimitItem[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    }[]>;
    deleteLimit(planId: string, limitId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    }>;
    getResourceLimit(planId: string, resourceKey: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    } | null>;
}
