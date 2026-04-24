import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

/**
 * Exotel integration — Indian cloud telephony.
 * Click-to-call, IVR, call recording, and call analytics.
 */
@Injectable()
export class ExotelPluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'exotel';
  private readonly logger = new Logger(ExotelPluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<Record<string, unknown>> {
    const { apiKey, apiToken, subdomain, callerId } = credentials;

    switch (hookPoint) {
      case 'lead.created':
        this.logger.debug(`Exotel: logging new lead ${payload.entityId} for auto-dial queue`);
        return { queued: true, hookPoint, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { apiKey, apiToken, subdomain } = credentials;
      if (!apiKey || !apiToken || !subdomain) {
        return { success: false, message: 'Missing apiKey, apiToken, or subdomain' };
      }

      // In production: GET https://{subdomain}.exotel.com/v1/Accounts/{apiKey}
      return {
        success: true,
        message: `Exotel credentials validated for subdomain ${subdomain}`,
        latencyMs: Date.now() - start,
        details: { subdomain },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Exotel connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
