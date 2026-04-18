import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { WhitelistModuleDto } from './dto/whitelist-module.dto';
import { SetFeatureFlagDto } from './dto/set-feature-flag.dto';
export declare class BrandManagerService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    getBrands(): Promise<{
        brandId: string;
        modulesCount: number;
        featuresCount: number;
        totalErrors: number;
        criticalCount: number;
    }[]>;
    getBrandDetail(brandId: string): Promise<{
        brandId: string;
        modules: {
            id: string;
            status: string;
            brandId: string;
            moduleCode: string;
            enabledAt: Date;
            enabledBy: string | null;
            trialExpiresAt: Date | null;
        }[];
        features: {
            id: string;
            updatedAt: Date;
            config: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
            isEnabled: boolean;
            brandId: string;
            featureCode: string;
        }[];
        errorSummary: {
            id: string;
            updatedAt: Date;
            brandId: string;
            period: string;
            totalErrors: number;
            criticalCount: number;
            resolvedCount: number;
            topModules: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        }[];
        recentErrors: {
            id: string;
            tenantId: string | null;
            createdAt: Date;
            module: string | null;
            userId: string | null;
            brandId: string | null;
            severity: string;
            errorCode: string;
            message: string;
            userAgent: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            httpStatus: number | null;
            component: string | null;
            ipAddress: string | null;
            endpoint: string | null;
            resolvedBy: string | null;
            stackTrace: string | null;
            verticalType: string | null;
            requestContext: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        }[];
    }>;
    getModules(brandId: string): Promise<{
        id: string;
        status: string;
        brandId: string;
        moduleCode: string;
        enabledAt: Date;
        enabledBy: string | null;
        trialExpiresAt: Date | null;
    }[]>;
    whitelistModule(brandId: string, dto: WhitelistModuleDto): Promise<{
        id: string;
        status: string;
        brandId: string;
        moduleCode: string;
        enabledAt: Date;
        enabledBy: string | null;
        trialExpiresAt: Date | null;
    }>;
    updateModule(id: string, data: {
        status?: string;
        trialExpiresAt?: string;
    }): Promise<{
        id: string;
        status: string;
        brandId: string;
        moduleCode: string;
        enabledAt: Date;
        enabledBy: string | null;
        trialExpiresAt: Date | null;
    }>;
    removeModule(id: string): Promise<{
        id: string;
        status: string;
        brandId: string;
        moduleCode: string;
        enabledAt: Date;
        enabledBy: string | null;
        trialExpiresAt: Date | null;
    }>;
    getFeatures(brandId: string): Promise<{
        flags: {
            id: string;
            updatedAt: Date;
            config: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
            isEnabled: boolean;
            brandId: string;
            featureCode: string;
        }[];
        allFeatureCodes: string[];
    }>;
    setFeatureFlag(brandId: string, dto: SetFeatureFlagDto): Promise<{
        id: string;
        updatedAt: Date;
        config: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        isEnabled: boolean;
        brandId: string;
        featureCode: string;
    }>;
    updateFeatureFlag(id: string, data: {
        isEnabled?: boolean;
        config?: Record<string, unknown>;
    }): Promise<{
        id: string;
        updatedAt: Date;
        config: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        isEnabled: boolean;
        brandId: string;
        featureCode: string;
    }>;
    removeFeatureFlag(id: string): Promise<{
        id: string;
        updatedAt: Date;
        config: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        isEnabled: boolean;
        brandId: string;
        featureCode: string;
    }>;
    getErrorOverview(): Promise<{
        brands: {
            id: string;
            updatedAt: Date;
            brandId: string;
            period: string;
            totalErrors: number;
            criticalCount: number;
            resolvedCount: number;
            topModules: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        }[];
        totalAcrossAll: number;
        worstBrand: {
            id: string;
            updatedAt: Date;
            brandId: string;
            period: string;
            totalErrors: number;
            criticalCount: number;
            resolvedCount: number;
            topModules: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        } | null;
    }>;
    getBrandErrors(brandId: string): Promise<{
        id: string;
        updatedAt: Date;
        brandId: string;
        period: string;
        totalErrors: number;
        criticalCount: number;
        resolvedCount: number;
        topModules: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }[]>;
}
