import { OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';
export declare class WhatsAppPluginHandler implements PluginHandler, OnModuleInit {
    private readonly registry;
    readonly pluginCode = "whatsapp_cloud";
    private readonly logger;
    constructor(registry: PluginHandlerRegistry);
    onModuleInit(): void;
    handle(hookPoint: string, payload: HookPayload, credentials: Record<string, any>): Promise<Record<string, unknown>>;
    testConnection(credentials: Record<string, any>): Promise<HealthCheckResult>;
}
