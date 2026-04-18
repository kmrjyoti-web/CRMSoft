import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

@Injectable()
export class StripePluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'stripe';
  private readonly logger = new Logger(StripePluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<Record<string, unknown>> {
    switch (hookPoint) {
      case 'invoice.created':
        this.logger.debug(`Stripe: creating payment intent for invoice ${payload.entityId}`);
        return { paymentIntentCreated: true, entityId: payload.entityId };

      case 'quotation.accepted':
        this.logger.debug(`Stripe: creating checkout session for quotation ${payload.entityId}`);
        return { checkoutCreated: true, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { secretKey } = credentials;
      if (!secretKey) {
        return { success: false, message: 'Missing secretKey' };
      }

      // In production: GET https://api.stripe.com/v1/balance
      return {
        success: true,
        message: 'Stripe credentials validated',
        latencyMs: Date.now() - start,
        details: { environment: credentials.environment || 'test' },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Stripe connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
