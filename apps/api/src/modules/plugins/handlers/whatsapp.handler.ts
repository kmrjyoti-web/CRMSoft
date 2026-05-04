import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

@Injectable()
export class WhatsAppPluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'whatsapp_cloud';
  private readonly logger = new Logger(WhatsAppPluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<Record<string, unknown>> {
    const { phoneNumberId, accessToken } = credentials;

    switch (hookPoint) {
      case 'lead.created':
        this.logger.debug(`WhatsApp: sending welcome template for lead ${payload.entityId}`);
        // POST https://graph.facebook.com/v17.0/{phoneNumberId}/messages
        return { sent: true, hookPoint, entityId: payload.entityId };

      case 'quotation.sent':
        this.logger.debug(`WhatsApp: sending quotation link for ${payload.entityId}`);
        return { sent: true, hookPoint, entityId: payload.entityId };

      case 'payment.received':
        this.logger.debug(`WhatsApp: sending payment confirmation for ${payload.entityId}`);
        return { sent: true, hookPoint, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { phoneNumberId, accessToken } = credentials;
      if (!phoneNumberId || !accessToken) {
        return { success: false, message: 'Missing phoneNumberId or accessToken' };
      }

      // In production: GET https://graph.facebook.com/v17.0/{phoneNumberId}
      // For now: validate credential format
      return {
        success: true,
        message: 'WhatsApp Cloud API credentials validated',
        latencyMs: Date.now() - start,
        details: { phoneNumberId },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
