import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ModuleManagerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listTenantModules(tenantId: string): Promise<{
        moduleId: string;
        code: string;
        name: string;
        description: string | null;
        category: import("@prisma/platform-client").$Enums.ModuleCategory;
        isCore: boolean;
        iconName: string | null;
        dependsOn: string[];
        autoEnables: string[];
        requiresCredentials: boolean;
        credentialSchema: import("@prisma/platform-client/runtime/library").JsonValue;
        isFreeInBase: boolean;
        priceMonthly: import("@prisma/platform-client/runtime/library").Decimal | null;
        priceYearly: import("@prisma/platform-client/runtime/library").Decimal | null;
        trialDays: number;
        status: string;
        enabledAt: Date | null;
        trialEndsAt: Date | null;
        credentialsStatus: import("@prisma/platform-client").$Enums.CredentialValidationStatus;
        enabledBy: string | null;
    }[]>;
    getModuleStatus(tenantId: string, moduleCode: string): Promise<{
        code: string;
        name: string;
        status: string;
        enabledAt: Date | null;
        trialEndsAt: Date | null;
        credentialsStatus: import("@prisma/platform-client").$Enums.CredentialValidationStatus;
        requiresCredentials: boolean;
        credentialSchema: import("@prisma/platform-client/runtime/library").JsonValue;
    }>;
    enableModule(tenantId: string, moduleCode: string, userId: string): Promise<{
        code: string;
        status: string;
    }[]>;
    disableModule(tenantId: string, moduleCode: string): Promise<{
        code: string;
        status: string;
    }>;
    updateCredentials(tenantId: string, moduleCode: string, credentials: Record<string, any>): Promise<{
        code: string;
        credentialsStatus: string;
    }>;
    validateCredentials(tenantId: string, moduleCode: string): Promise<{
        code: string;
        credentialsStatus: string;
        validatedAt: Date;
    }>;
    getEnabledModuleCodes(tenantId: string): Promise<string[]>;
    private findDefinitionByCode;
    private resolveAutoEnables;
}
