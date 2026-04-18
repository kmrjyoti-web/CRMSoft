export interface PluginHandler {
    readonly pluginCode: string;
    handle(hookPoint: string, payload: HookPayload, credentials: Record<string, any>, settings?: Record<string, any>): Promise<Record<string, unknown>>;
    testConnection(credentials: Record<string, any>): Promise<HealthCheckResult>;
}
export interface HookPayload {
    tenantId: string;
    entityType: string;
    entityId: string;
    action: string;
    data: Record<string, unknown>;
    userId?: string;
}
export interface HealthCheckResult {
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: Record<string, any>;
}
export declare class PluginHandlerRegistry {
    private readonly logger;
    private readonly handlers;
    register(handler: PluginHandler): void;
    get(pluginCode: string): PluginHandler | undefined;
    has(pluginCode: string): boolean;
    getAll(): Map<string, PluginHandler>;
    getCodes(): string[];
}
