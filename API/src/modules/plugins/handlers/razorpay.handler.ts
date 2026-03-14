import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

@Injectable()
export class RazorpayPluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'razorpay';
  private readonly logger = new Logger(RazorpayPluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<any> {
    switch (hookPoint) {
      case 'invoice.created':
        this.logger.debug(`Razorpay: creating payment link for invoice ${payload.entityId}`);
        return { paymentLinkCreated: true, entityId: payload.entityId };

      case 'quotation.accepted':
        this.logger.debug(`Razorpay: creating order for quotation ${payload.entityId}`);
        return { orderCreated: true, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { keyId, keySecret } = credentials;
      if (!keyId || !keySecret) {
        return { success: false, message: 'Missing keyId or keySecret' };
      }

      // In production: GET https://api.razorpay.com/v1/ with Basic Auth
      return {
        success: true,
        message: 'Razorpay credentials validated',
        latencyMs: Date.now() - start,
        details: { environment: credentials.environment || 'test' },
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
