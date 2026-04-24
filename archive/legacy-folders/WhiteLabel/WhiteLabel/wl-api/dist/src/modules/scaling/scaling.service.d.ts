import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class ScalingService {
    private prisma;
    private audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    getOrCreatePolicy(partnerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        maxInstances: number;
        minInstances: number;
        currentInstances: number;
        scaleUpThreshold: number;
        scaleDownThreshold: number;
        isAutoScalingEnabled: boolean;
        cooldownMinutes: number;
        lastScaledAt: Date | null;
    }>;
    updatePolicy(partnerId: string, dto: {
        maxInstances?: number;
        minInstances?: number;
        scaleUpThreshold?: number;
        scaleDownThreshold?: number;
        isAutoScalingEnabled?: boolean;
        cooldownMinutes?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        maxInstances: number;
        minInstances: number;
        currentInstances: number;
        scaleUpThreshold: number;
        scaleDownThreshold: number;
        isAutoScalingEnabled: boolean;
        cooldownMinutes: number;
        lastScaledAt: Date | null;
    }>;
    private computeUsageMetric;
    evaluatePartner(partnerId: string): Promise<{
        action: string;
        metric: number;
    }>;
    private scaleUp;
    private scaleDown;
    evaluateAll(): Promise<void>;
    getScalingHistory(partnerId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        partnerId: string;
        reason: string;
        triggeredBy: string;
        eventType: import("@prisma/client").$Enums.ScalingEventType;
        fromInstances: number;
        toInstances: number;
        usageMetric: number | null;
    }[]>;
    getScalingDashboard(): Promise<{
        totalScaleUps: number;
        totalScaleDowns: number;
        enabledPolicies: number;
        recentEvents: ({
            partner: {
                companyName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            partnerId: string;
            reason: string;
            triggeredBy: string;
            eventType: import("@prisma/client").$Enums.ScalingEventType;
            fromInstances: number;
            toInstances: number;
            usageMetric: number | null;
        })[];
        allPolicies: ({
            partner: {
                companyName: string;
                plan: import("@prisma/client").$Enums.PartnerPlan;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            maxInstances: number;
            minInstances: number;
            currentInstances: number;
            scaleUpThreshold: number;
            scaleDownThreshold: number;
            isAutoScalingEnabled: boolean;
            cooldownMinutes: number;
            lastScaledAt: Date | null;
        })[];
    }>;
    private getCurrentPeriod;
}
