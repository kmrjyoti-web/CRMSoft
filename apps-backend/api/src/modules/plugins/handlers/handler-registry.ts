import { Injectable, Logger } from '@nestjs/common';

/**
 * Plugin handler interface — each plugin implements this to handle hook events.
 */
export interface PluginHandler {
  /** Plugin code (must match PluginRegistry.code) */
  readonly pluginCode: string;

  /**
   * Handle a hook event.
   * @returns response payload (logged in PluginHookLog)
   */
  handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
    settings?: Record<string, any>,
  ): Promise<Record<string, unknown>>;

  /**
   * Test connection with given credentials.
   * @returns { success: boolean, message: string }
   */
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

/**
 * Central registry that maps pluginCode → PluginHandler.
 * Handlers self-register via constructor injection.
 */
@Injectable()
export class PluginHandlerRegistry {
  private readonly logger = new Logger(PluginHandlerRegistry.name);
  private readonly handlers = new Map<string, PluginHandler>();

  register(handler: PluginHandler): void {
    this.handlers.set(handler.pluginCode, handler);
    this.logger.log(`Registered plugin handler: ${handler.pluginCode}`);
  }

  get(pluginCode: string): PluginHandler | undefined {
    return this.handlers.get(pluginCode);
  }

  has(pluginCode: string): boolean {
    return this.handlers.has(pluginCode);
  }

  getAll(): Map<string, PluginHandler> {
    return this.handlers;
  }

  getCodes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
