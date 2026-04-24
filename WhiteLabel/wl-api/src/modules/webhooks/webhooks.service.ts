import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private billing: BillingService,
    private audit: AuditService,
  ) {}

  verifyRazorpaySignature(rawBody: Buffer, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret) {
      this.logger.warn('RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  }

  async handleRazorpayEvent(rawBody: Buffer, signature: string): Promise<void> {
    const isVerified = this.verifyRazorpaySignature(rawBody, signature);
    const payload = JSON.parse(rawBody.toString('utf8'));
    const eventType: string = payload?.event ?? 'unknown';

    const event = await this.prisma.webhookEvent.create({
      data: {
        source: 'razorpay',
        eventType,
        payload,
        signature,
        isVerified,
        processingStatus: 'PENDING',
      },
    });

    if (!isVerified) {
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processingStatus: 'FAILED', errorMessage: 'Signature verification failed' },
      });
      throw new UnauthorizedException('Invalid webhook signature');
    }

    try {
      await this.processRazorpayEvent(eventType, payload);
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processingStatus: 'PROCESSED', processedAt: new Date() },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook processing failed for event ${eventType}: ${msg}`);
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processingStatus: 'FAILED', errorMessage: msg },
      });
    }
  }

  private async processRazorpayEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    switch (eventType) {
      case 'payment.captured':
        await this.onPaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.onPaymentFailed(payload);
        break;
      case 'refund.created':
        await this.onRefundCreated(payload);
        break;
      default:
        this.logger.log(`Unhandled Razorpay event: ${eventType}`);
    }
  }

  private async onPaymentCaptured(payload: Record<string, unknown>): Promise<void> {
    const payment = (payload?.payload as Record<string, unknown>)?.payment as Record<string, unknown> | undefined;
    const entity = (payment?.entity as Record<string, unknown>) ?? {};
    const razorpayPaymentId = entity.id as string | undefined;
    const notes = (entity.notes as Record<string, unknown>) ?? {};
    const invoiceId = notes.invoiceId as string | undefined;

    if (!invoiceId) {
      this.logger.warn(`payment.captured: no invoiceId in notes for payment ${razorpayPaymentId}`);
      return;
    }

    await this.billing.markPaid(invoiceId, razorpayPaymentId);
    await this.audit.log({
      action: 'RAZORPAY_PAYMENT_CAPTURED',
      performedBy: 'razorpay_webhook',
      performedByRole: 'SYSTEM',
      details: { razorpayPaymentId, invoiceId },
    });
    this.logger.log(`Invoice ${invoiceId} marked PAID via Razorpay payment ${razorpayPaymentId}`);
  }

  private async onPaymentFailed(payload: Record<string, unknown>): Promise<void> {
    const payment = (payload?.payload as Record<string, unknown>)?.payment as Record<string, unknown> | undefined;
    const entity = (payment?.entity as Record<string, unknown>) ?? {};
    const razorpayPaymentId = entity.id as string | undefined;
    const errorDesc = (entity.error_description as string) ?? 'Unknown error';

    await this.audit.log({
      action: 'RAZORPAY_PAYMENT_FAILED',
      performedBy: 'razorpay_webhook',
      performedByRole: 'SYSTEM',
      details: { razorpayPaymentId, error: errorDesc },
    });
    this.logger.warn(`Razorpay payment failed: ${razorpayPaymentId} — ${errorDesc}`);
  }

  private async onRefundCreated(payload: Record<string, unknown>): Promise<void> {
    const refund = (payload?.payload as Record<string, unknown>)?.refund as Record<string, unknown> | undefined;
    const entity = (refund?.entity as Record<string, unknown>) ?? {};
    const refundId = entity.id as string | undefined;
    const amount = entity.amount as number | undefined;

    await this.audit.log({
      action: 'RAZORPAY_REFUND_CREATED',
      performedBy: 'razorpay_webhook',
      performedByRole: 'SYSTEM',
      details: { refundId, amount },
    });
    this.logger.log(`Razorpay refund created: ${refundId} for ₹${amount}`);
  }

  async getEvents(params: { page?: number; limit?: number; status?: string; source?: string }) {
    const { page = 1, limit = 20, status, source } = params;
    const where: Record<string, unknown> = {};
    if (status) where.processingStatus = status;
    if (source) where.source = source;

    const [data, total] = await Promise.all([
      this.prisma.webhookEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookEvent.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getDashboard() {
    const [total, processed, failed, pending, last24h] = await Promise.all([
      this.prisma.webhookEvent.count(),
      this.prisma.webhookEvent.count({ where: { processingStatus: 'PROCESSED' } }),
      this.prisma.webhookEvent.count({ where: { processingStatus: 'FAILED' } }),
      this.prisma.webhookEvent.count({ where: { processingStatus: 'PENDING' } }),
      this.prisma.webhookEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    ]);
    const successRate = total > 0 ? Math.round((processed / total) * 100) : 100;
    return { total, processed, failed, pending, last24h, successRate };
  }
}
