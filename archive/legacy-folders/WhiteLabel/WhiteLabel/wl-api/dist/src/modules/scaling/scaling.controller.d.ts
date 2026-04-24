import { ScalingService } from './scaling.service';
declare class UpdatePolicyDto {
    maxInstances?: number;
    minInstances?: number;
    scaleUpThreshold?: number;
    scaleDownThreshold?: number;
    isAutoScalingEnabled?: boolean;
    cooldownMinutes?: number;
}
export declare class ScalingController {
    private scalingService;
    constructor(scalingService: ScalingService);
    getDashboard(): Promise<{
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
    getPolicy(partnerId: string): Promise<{
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
    updatePolicy(partnerId: string, dto: UpdatePolicyDto): Promise<{
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
    getHistory(partnerId: string, limit?: string): Promise<{
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
    evaluatePartner(partnerId: string): Promise<{
        action: string;
        metric: number;
    }>;
    evaluateAll(): Promise<{
        triggered: boolean;
    }>;
}
export {};
