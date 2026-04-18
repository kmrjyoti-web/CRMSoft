import { ApiResponse } from '../../../../common/utils/api-response';
import { ModuleManagerService } from '../services/module-manager.service';
import { UpdateCredentialsDto } from './dto/module-manager.dto';
export declare class ModuleManagerController {
    private readonly service;
    constructor(service: ModuleManagerService);
    listModules(tenantId: string): Promise<ApiResponse<{
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
    }[]>>;
    getStatus(code: string, tenantId: string): Promise<ApiResponse<{
        code: string;
        name: string;
        status: string;
        enabledAt: Date | null;
        trialEndsAt: Date | null;
        credentialsStatus: import("@prisma/platform-client").$Enums.CredentialValidationStatus;
        requiresCredentials: boolean;
        credentialSchema: import("@prisma/platform-client/runtime/library").JsonValue;
    }>>;
    enableModule(code: string, tenantId: string, userId: string): Promise<ApiResponse<{
        code: string;
        status: string;
    }[]>>;
    disableModule(code: string, tenantId: string): Promise<ApiResponse<{
        code: string;
        status: string;
    }>>;
    updateCredentials(code: string, dto: UpdateCredentialsDto, tenantId: string): Promise<ApiResponse<{
        code: string;
        credentialsStatus: string;
    }>>;
    validateCredentials(code: string, tenantId: string): Promise<ApiResponse<{
        code: string;
        credentialsStatus: string;
        validatedAt: Date;
    }>>;
}
