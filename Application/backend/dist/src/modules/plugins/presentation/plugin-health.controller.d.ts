import { PluginHealthService } from '../services/plugin-health.service';
export declare class PluginHealthController {
    private readonly healthService;
    constructor(healthService: PluginHealthService);
    testInstalledPlugin(tenantId: string, code: string): Promise<import("../handlers/handler-registry").HealthCheckResult>;
    testWithCredentials(code: string, body: {
        credentials: Record<string, any>;
    }): Promise<import("../handlers/handler-registry").HealthCheckResult>;
    getHealthSummary(tenantId: string): Promise<{
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
