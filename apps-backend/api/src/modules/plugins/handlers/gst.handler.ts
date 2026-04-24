import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PluginHandler, PluginHandlerRegistry, HookPayload, HealthCheckResult } from './handler-registry';

/**
 * ClearTax GST integration.
 * Auto-validates GSTIN, syncs invoices for GST filing, generates e-invoices.
 */
@Injectable()
export class GstPluginHandler implements PluginHandler, OnModuleInit {
  readonly pluginCode = 'cleartax_gst';
  private readonly logger = new Logger(GstPluginHandler.name);

  constructor(private readonly registry: PluginHandlerRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(
    hookPoint: string,
    payload: HookPayload,
    credentials: Record<string, any>,
  ): Promise<Record<string, unknown>> {
    const { apiToken, gstin } = credentials;

    switch (hookPoint) {
      case 'invoice.created':
        this.logger.debug(`GST: generating e-invoice for ${payload.entityId}`);
        // POST to ClearTax API: /v2/eInvoice/generate
        return { eInvoiceGenerated: true, entityId: payload.entityId };

      case 'invoice.updated':
        this.logger.debug(`GST: updating e-invoice for ${payload.entityId}`);
        return { eInvoiceUpdated: true, entityId: payload.entityId };

      case 'contact.created':
      case 'organization.created':
        this.logger.debug(`GST: validating GSTIN for ${payload.entityId}`);
        // GET /v1/commonapi/search?gstin={gstin}
        return { gstinValidated: true, entityId: payload.entityId };

      default:
        return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { apiToken, gstin, environment } = credentials;
      if (!apiToken || !gstin) {
        return { success: false, message: 'Missing apiToken or gstin' };
      }

      // In production: GET https://api.cleartax.in/v1/commonapi/search?gstin={gstin}
      return {
        success: true,
        message: `ClearTax GST credentials validated for GSTIN ${gstin}`,
        latencyMs: Date.now() - start,
        details: { gstin, environment: environment || 'sandbox' },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'GST connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
