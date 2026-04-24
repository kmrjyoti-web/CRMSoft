import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare const AVAILABLE_FEATURES: {
    code: string;
    label: string;
    description: string;
    category: string;
}[];
export declare class FeatureFlagsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getAvailableFeatures(): {
        code: string;
        label: string;
        description: string;
        category: string;
    }[];
    getByPartner(partnerId: string): Promise<{
        isEnabled: boolean;
        config: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
        flagId: string | null;
        code: string;
        label: string;
        description: string;
        category: string;
    }[]>;
    getEnabled(partnerId: string): Promise<string[]>;
    toggle(partnerId: string, featureCode: string, isEnabled: boolean, config?: Record<string, unknown>, performedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        featureCode: string;
        isEnabled: boolean;
        config: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    bulkSet(partnerId: string, features: {
        featureCode: string;
        isEnabled: boolean;
    }[], performedBy?: string): Promise<{
        updated: number;
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            featureCode: string;
            isEnabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
    enableAll(partnerId: string, performedBy?: string): Promise<{
        updated: number;
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            featureCode: string;
            isEnabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
    disableAll(partnerId: string, performedBy?: string): Promise<{
        updated: number;
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            featureCode: string;
            isEnabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
    getDashboard(): Promise<{
        byFeature: {
            code: string;
            label: string;
            category: string;
            enabledCount: number;
        }[];
        totalFlags: number;
    }>;
}
