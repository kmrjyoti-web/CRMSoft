import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WebhookService } from './webhook.service';
import { WebhookSignerService } from './webhook-signer.service';

const RETRY_DELAYS = [0, 60_000, 300_000, 1800_000, 7200_000]; // 0, 1m, 5m, 30m, 2h

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
    private readonly signer: WebhookSignerService,
  ) {}

  async dispatch(tenantId: string, eventType: string, entityId: string, data: Record<string, any>) {
    const endpoints = await this.webhookService.getActiveEndpointsForEvent(tenantId, eventType);
    if (endpoints.length === 0) return;

    const eventId = randomUUID();
    const payload = {
      id: eventId,
      type: eventType,
      apiVersion: 'v1',
      createdAt: new Date().toISOString(),
      data: { object: data },
      tenantId,
    };

    for (const endpoint of endpoints) {
      const signature = this.signer.sign(payload, endpoint.secret);
      const payloadStr = JSON.stringify(payload);

      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          tenantId,
          endpointId: endpoint.id,
          eventType,
          eventId,
          payload,
          payloadSize: payloadStr.length,
          signature: `sha256=${signature}`,
          scheduledAt: new Date(),
          maxAttempts: endpoint.maxRetries,
        },
      });

      // Deliver async
      this.attemptDelivery(delivery.id, endpoint, payloadStr, signature).catch(err => {
        this.logger.error(`Delivery failed for ${delivery.id}: ${err.message}`);
      });
    }
  }

  private async attemptDelivery(
    deliveryId: string,
    endpoint: any,
    payloadStr: string,
    signature: string,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': endpoint.contentType || 'application/json',
      'X-CRM-Signature': `sha256=${signature}`,
      'X-CRM-Event': '',
      'X-CRM-Delivery-Id': deliveryId,
      'X-CRM-Timestamp': String(Math.floor(Date.now() / 1000)),
    };

    // Add custom headers
    if (endpoint.customHeaders) {
      const custom = typeof endpoint.customHeaders === 'object' ? endpoint.customHeaders : {};
      Object.assign(headers, custom);
    }

    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), (endpoint.timeoutSeconds || 30) * 1000);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: payloadStr,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const responseTimeMs = Date.now() - start;
      const responseBody = await response.text().catch(() => '');

      if (response.ok) {
        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'WH_DELIVERED',
            httpStatus: response.status,
            responseBody: responseBody.substring(0, 4096),
            responseTimeMs,
            deliveredAt: new Date(),
          },
        });
        await this.prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: {
            lastDeliveredAt: new Date(),
            totalDelivered: { increment: 1 },
            consecutiveFailures: 0,
          },
        });
      } else {
        await this.handleFailure(deliveryId, endpoint.id, `HTTP ${response.status}`, response.status, responseTimeMs);
      }
    } catch (err: any) {
      const responseTimeMs = Date.now() - start;
      await this.handleFailure(deliveryId, endpoint.id, err.message, null, responseTimeMs);
    }
  }

  private async handleFailure(
    deliveryId: string,
    endpointId: string,
    error: string,
    httpStatus: number | null,
    responseTimeMs: number,
  ) {
    const delivery = await this.prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) return;

    const nextAttempt = delivery.attempt + 1;
    const canRetry = nextAttempt <= delivery.maxAttempts;
    const nextRetryAt = canRetry
      ? new Date(Date.now() + (RETRY_DELAYS[Math.min(nextAttempt - 1, RETRY_DELAYS.length - 1)] || 7200_000))
      : null;

    await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: canRetry ? 'WH_RETRYING' : 'WH_DELIVERY_FAILED',
        httpStatus,
        error,
        responseTimeMs,
        attempt: nextAttempt,
        nextRetryAt,
      },
    });

    const endpoint = await this.prisma.webhookEndpoint.update({
      where: { id: endpointId },
      data: {
        lastFailedAt: new Date(),
        lastError: error,
        totalFailed: { increment: 1 },
        consecutiveFailures: { increment: 1 },
      },
    });

    // Auto-disable after 10 consecutive failures
    if (endpoint.consecutiveFailures >= 10) {
      await this.prisma.webhookEndpoint.update({
        where: { id: endpointId },
        data: { status: 'WH_DISABLED' },
      });
      this.logger.warn(`Webhook ${endpointId} auto-disabled after 10 consecutive failures`);
    }
  }

  async retryFailedDeliveries() {
    const now = new Date();
    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: {
        status: { in: ['WH_DELIVERY_FAILED', 'WH_RETRYING'] },
        nextRetryAt: { lte: now },
      },
      include: { endpoint: true },
      take: 100,
    });

    let succeeded = 0, failed = 0;

    for (const delivery of deliveries) {
      if (delivery.endpoint.status !== 'WH_ACTIVE') continue;

      const payloadStr = JSON.stringify(delivery.payload);
      const signature = this.signer.sign(delivery.payload as Record<string, any>, delivery.endpoint.secret);

      await this.attemptDelivery(delivery.id, delivery.endpoint, payloadStr, signature);

      const updated = await this.prisma.webhookDelivery.findUnique({ where: { id: delivery.id } });
      if (updated?.status === 'WH_DELIVERED') succeeded++;
      else failed++;
    }

    return { retried: deliveries.length, succeeded, failed };
  }

  async getDeliveries(tenantId: string, endpointId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where: { tenantId, endpointId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.webhookDelivery.count({ where: { tenantId, endpointId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
