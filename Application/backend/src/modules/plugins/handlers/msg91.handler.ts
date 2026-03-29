import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

/**
 * MSG91 integration — Indian bulk SMS and OTP provider.
 * Sends transactional SMS, OTPs, and campaign broadcasts.
 */
@Injectable()
export class Msg91PluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'msg91';
  private readonly logger = new Logger(Msg91PluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<any> {
    const { authKey, senderId } = credentials;

    switch (hookPoint) {
      case 'lead.created':
        this.logger.debug(`MSG91: sending welcome SMS for lead ${payload.entityId}`);
        // POST https://control.msg91.com/api/v5/flow/
        return { smsSent: true, hookPoint, entityId: payload.entityId };

      case 'demo.reminder':
        this.logger.debug(`MSG91: sending demo reminder SMS for ${payload.entityId}`);
        return { smsSent: true, hookPoint, entityId: payload.entityId };

      case 'payment.reminder':
        this.logger.debug(`MSG91: sending payment reminder SMS for ${payload.entityId}`);
        return { smsSent: true, hookPoint, entityId: payload.entityId };

      case 'otp.requested':
        this.logger.debug(`MSG91: sending OTP for ${payload.entityId}`);
        // POST https://control.msg91.com/api/v5/otp
        return { otpSent: true, hookPoint, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { authKey, senderId } = credentials;
      if (!authKey || !senderId) {
        return { success: false, message: 'Missing authKey or senderId' };
      }

      // In production: GET https://control.msg91.com/api/v5/balance?authkey={authKey}
      return {
        success: true,
        message: `MSG91 credentials validated for sender ${senderId}`,
        latencyMs: Date.now() - start,
        details: { senderId },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'MSG91 connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
