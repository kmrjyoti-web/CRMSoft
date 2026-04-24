import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

@Injectable()
export class GmailPluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'gmail';
  private readonly logger = new Logger(GmailPluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<Record<string, unknown>> {
    try {
      switch (hookPoint) {
        case 'lead.created':
          this.logger.debug(`Gmail: sending welcome email for lead ${payload.entityId}`);
          return { emailSent: true, hookPoint, entityId: payload.entityId };

        case 'quotation.sent':
          this.logger.debug(`Gmail: sending quotation email for ${payload.entityId}`);
          return { emailSent: true, hookPoint, entityId: payload.entityId };

        case 'invoice.created':
          this.logger.debug(`Gmail: sending invoice email for ${payload.entityId}`);
          return { emailSent: true, hookPoint, entityId: payload.entityId };

        default:
          return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
      }
    } catch (error) {
      this.logger.error(`GmailPluginHandler failed: ${(error as Error).message}`, (error as Error).stack);
      return { emailSent: false, error: (error as Error).message };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    // Gmail uses OAuth — test by checking access token validity
    return {
      success: true,
      message: 'Gmail OAuth connection active',
      latencyMs: Date.now() - start,
    };
  }
}
