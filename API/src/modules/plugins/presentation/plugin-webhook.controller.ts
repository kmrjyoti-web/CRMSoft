import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Req,
  Res,
  RawBodyRequest,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginHookService } from '../services/plugin-hook.service';
import { PluginService } from '../services/plugin.service';
import { EncryptionService } from '../../tenant-config/services/encryption.service';

/**
 * Inbound webhook handler for external plugin callbacks.
 * Routes: /webhooks/:pluginCode/:tenantId
 *
 * Supports:
 * - HMAC-SHA256 signature verification (Razorpay, Stripe)
 * - WhatsApp challenge verification (GET)
 * - Generic JSON payloads
 */
@Controller('webhooks')
export class PluginWebhookController {
  private readonly logger = new Logger(PluginWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hookService: PluginHookService,
    private readonly pluginService: PluginService,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * WhatsApp webhook verification (GET challenge).
   */
  @Get(':pluginCode/:tenantId')
  async verifyWebhook(
    @Param('pluginCode') pluginCode: string,
    @Param('tenantId') tenantId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode !== 'subscribe' || !verifyToken) {
      return res.status(403).send('Forbidden');
    }

    try {
      const credentials = await this.pluginService.getDecryptedCredentials(
        tenantId,
        pluginCode,
      );

      if (credentials?.webhookVerifyToken === verifyToken) {
        this.logger.log(`Webhook verified for ${pluginCode}/${tenantId}`);
        return res.status(200).send(challenge);
      }
    } catch {
      // Plugin not found or not enabled
    }

    return res.status(403).send('Verification failed');
  }

  /**
   * Inbound webhook handler (POST).
   * Verifies signature, then fires hook to PluginHookService.
   */
  @Post(':pluginCode/:tenantId')
  async handleWebhook(
    @Param('pluginCode') pluginCode: string,
    @Param('tenantId') tenantId: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.debug(`Webhook received: ${pluginCode}/${tenantId}`);

    // Verify plugin is enabled for this tenant
    const isEnabled = await this.pluginService.isPluginEnabled(tenantId, pluginCode);
    if (!isEnabled) {
      throw new BadRequestException(`Plugin "${pluginCode}" is not enabled`);
    }

    // Get plugin registry for webhook config
    const plugin = await this.prisma.pluginRegistry.findUnique({
      where: { code: pluginCode },
    });
    if (!plugin?.webhookConfig) {
      throw new BadRequestException(`Plugin "${pluginCode}" does not support webhooks`);
    }

    const webhookConfig = plugin.webhookConfig as any;

    // Verify signature if required
    if (webhookConfig.verificationMethod === 'signature') {
      await this.verifySignature(
        pluginCode,
        tenantId,
        webhookConfig,
        req,
      );
    }

    // Parse the webhook payload
    const body = req.body;
    const eventType = this.extractEventType(pluginCode, body);

    // Fire async hook (non-blocking)
    this.hookService
      .fireHook(`webhook.${pluginCode}.${eventType}`, {
        tenantId,
        entityType: pluginCode,
        entityId: body?.id || body?.entity?.id || 'unknown',
        action: eventType,
        data: body,
      })
      .catch((err) =>
        this.logger.error(`Webhook hook failed: ${err.message}`),
      );

    return { received: true, event: eventType };
  }

  /**
   * Verify HMAC signature for inbound webhooks.
   */
  private async verifySignature(
    pluginCode: string,
    tenantId: string,
    webhookConfig: any,
    req: RawBodyRequest<Request>,
  ): Promise<void> {
    const signatureHeader = webhookConfig.signatureHeader;
    const signature = req.headers[signatureHeader?.toLowerCase()] as string;

    if (!signature) {
      throw new BadRequestException(`Missing signature header: ${signatureHeader}`);
    }

    // Get webhook secret from stored credentials
    const credentials = await this.pluginService.getDecryptedCredentials(
      tenantId,
      pluginCode,
    );

    const secret = credentials?.webhookSecret as string;
    if (!secret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    const rawBody = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

    // Plugin-specific verification
    let isValid = false;

    if (pluginCode === 'razorpay') {
      // Razorpay uses HMAC-SHA256
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } else if (pluginCode === 'stripe') {
      // Stripe uses timestamp + HMAC-SHA256
      const parts = signature.split(',');
      const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
      const sig = parts.find((p) => p.startsWith('v1='))?.slice(3);

      if (timestamp && sig) {
        const payload = `${timestamp}.${rawBody}`;
        const expected = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
        isValid = crypto.timingSafeEqual(
          Buffer.from(sig),
          Buffer.from(expected),
        );
      }
    } else {
      // Generic HMAC-SHA256 verification
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    }

    if (!isValid) {
      this.logger.warn(`Invalid webhook signature for ${pluginCode}/${tenantId}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Extract event type from webhook payload based on plugin.
   */
  private extractEventType(pluginCode: string, body: any): string {
    switch (pluginCode) {
      case 'razorpay':
        return body?.event || 'unknown';
      case 'stripe':
        return body?.type || 'unknown';
      case 'whatsapp_cloud':
        return body?.entry?.[0]?.changes?.[0]?.field || 'messages';
      case 'exotel':
        return body?.EventType || body?.Status || 'call';
      default:
        return body?.event || body?.type || 'webhook';
    }
  }
}
