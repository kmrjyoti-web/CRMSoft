import { OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';
export declare class StripePluginHandler implements PluginHandler, OnModuleInit {
    private readonly registry;
    readonly pluginCode = "stripe";
    private readonly logger;
    constructor(registry: PluginHandlerRegistry);
    onModuleInit(): void;
    handle(hookPoint: string, payload: HookPayload, credentials: Record<string, any>): Promise<Record<string, unknown>>;
    testConnection(credentials: Record<string, any>): Promise<HealthCheckResult>;
}
