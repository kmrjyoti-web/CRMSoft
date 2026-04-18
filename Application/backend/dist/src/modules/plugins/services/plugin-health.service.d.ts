import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';
import { PluginHandlerRegistry, HealthCheckResult } from '../handlers/handler-registry';
export declare class PluginHealthService {
    private readonly prisma;
    private readonly encryption;
    private readonly handlerRegistry;
    private readonly logger;
    constructor(prisma: PrismaService, encryption: EncryptionService, handlerRegistry: PluginHandlerRegistry);
    testWithCredentials(pluginCode: string, credentials: Record<string, any>): Promise<HealthCheckResult>;
    testInstalled(tenantId: string, pluginCode: string): Promise<HealthCheckResult>;
    getTenantPluginHealth(tenantId: string): Promise<{
        pluginCode: string;
        pluginName: string;
        status: import("@prisma/platform-client").$Enums.TenantPluginStatus;
        isEnabled: boolean;
        lastUsedAt: Date | null;
        lastErrorAt: Date | null;
        lastError: string | null;
        errorCount: number;
        consecutiveErrors: number;
        hasHandler: boolean;
    }[]>;
}
