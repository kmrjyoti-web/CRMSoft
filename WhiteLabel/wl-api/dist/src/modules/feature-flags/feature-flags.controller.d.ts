import { FeatureFlagsService } from './feature-flags.service';
declare class ToggleFeatureDto {
    isEnabled: boolean;
    config?: Record<string, unknown>;
}
declare class BulkFeatureItem {
    featureCode: string;
    isEnabled: boolean;
}
declare class BulkSetDto {
    features: BulkFeatureItem[];
}
export declare class FeatureFlagsController {
    private featureFlagsService;
    constructor(featureFlagsService: FeatureFlagsService);
    getAvailableFeatures(): {
        code: string;
        label: string;
        description: string;
        category: string;
    }[];
    getDashboard(): Promise<{
        byFeature: {
            code: string;
            label: string;
            category: string;
            enabledCount: number;
        }[];
        totalFlags: number;
    }>;
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
    toggle(partnerId: string, featureCode: string, dto: ToggleFeatureDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        featureCode: string;
        isEnabled: boolean;
        config: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    bulkSet(partnerId: string, dto: BulkSetDto): Promise<{
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
    enableAll(partnerId: string): Promise<{
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
    disableAll(partnerId: string): Promise<{
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
}
export {};
