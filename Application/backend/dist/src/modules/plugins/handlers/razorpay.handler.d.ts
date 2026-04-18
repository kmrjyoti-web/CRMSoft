import { OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';
export declare class RazorpayPluginHandler implements PluginHandler, OnModuleInit {
    private readonly registry;
    readonly pluginCode = "razorpay";
    private readonly logger;
    constructor(registry: PluginHandlerRegistry);
    onModuleInit(): void;
    handle(hookPoint: string, payload: HookPayload, credentials: Record<string, any>): Promise<Record<string, unknown>>;
    testConnection(credentials: Record<string, any>): Promise<HealthCheckResult>;
}
