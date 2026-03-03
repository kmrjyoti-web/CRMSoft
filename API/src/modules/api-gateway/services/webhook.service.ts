import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

const AVAILABLE_WEBHOOK_EVENTS = [
  { event: 'lead.created', description: 'New lead created' },
  { event: 'lead.updated', description: 'Lead details updated' },
  { event: 'lead.deleted', description: 'Lead deleted' },
  { event: 'lead.status_changed', description: 'Lead status changed' },
  { event: 'lead.assigned', description: 'Lead assigned to user' },
  { event: 'lead.won', description: 'Deal marked as won' },
  { event: 'lead.lost', description: 'Deal marked as lost' },
  { event: 'contact.created', description: 'New contact created' },
  { event: 'contact.updated', description: 'Contact updated' },
  { event: 'contact.deleted', description: 'Contact deleted' },
  { event: 'organization.created', description: 'Organization created' },
  { event: 'organization.updated', description: 'Organization updated' },
  { event: 'activity.created', description: 'Activity created' },
  { event: 'activity.completed', description: 'Activity completed' },
  { event: 'demo.scheduled', description: 'Demo scheduled' },
  { event: 'demo.completed', description: 'Demo completed' },
  { event: 'quotation.created', description: 'Quotation created' },
  { event: 'quotation.sent', description: 'Quotation sent' },
  { event: 'quotation.accepted', description: 'Quotation accepted' },
  { event: 'invoice.created', description: 'Invoice generated' },
  { event: 'invoice.sent', description: 'Invoice sent' },
  { event: 'invoice.paid', description: 'Invoice fully paid' },
  { event: 'invoice.overdue', description: 'Invoice overdue' },
  { event: 'payment.received', description: 'Payment received' },
  { event: 'payment.failed', description: 'Payment failed' },
  { event: 'payment.refunded', description: 'Payment refunded' },
  { event: 'document.uploaded', description: 'Document uploaded' },
];

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: {
    url: string;
    description?: string;
    events: string[];
    timeoutSeconds?: number;
    maxRetries?: number;
    customHeaders?: Record<string, string>;
  }, userId: string, userName: string) {
    const secret = randomBytes(32).toString('hex');

    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        tenantId,
        url: dto.url,
        description: dto.description,
        secret,
        events: dto.events,
        timeoutSeconds: dto.timeoutSeconds || 30,
        maxRetries: dto.maxRetries || 5,
        customHeaders: dto.customHeaders || undefined,
        createdById: userId,
        createdByName: userName,
      },
    });

    this.logger.log(`Webhook endpoint created for ${dto.url}`);

    return {
      endpoint,
      secret, // shown ONCE
      warning: 'Copy this secret now. It will not be shown again.',
    };
  }

  async listByTenant(tenantId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { tenantId },
      select: {
        id: true, url: true, description: true, events: true, status: true,
        lastDeliveredAt: true, lastFailedAt: true, totalDelivered: true, totalFailed: true,
        consecutiveFailures: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(tenantId: string, endpointId: string) {
    const ep = await this.prisma.webhookEndpoint.findFirst({
      where: { id: endpointId, tenantId },
    });
    if (!ep) throw AppError.from('WEBHOOK_NOT_FOUND');
    return ep;
  }

  async update(tenantId: string, endpointId: string, dto: {
    url?: string;
    description?: string;
    events?: string[];
    status?: string;
    timeoutSeconds?: number;
    maxRetries?: number;
    customHeaders?: Record<string, string>;
  }) {
    const ep = await this.prisma.webhookEndpoint.findFirst({
      where: { id: endpointId, tenantId },
    });
    if (!ep) throw AppError.from('WEBHOOK_NOT_FOUND');

    return this.prisma.webhookEndpoint.update({
      where: { id: endpointId },
      data: dto as any,
    });
  }

  async delete(tenantId: string, endpointId: string) {
    const ep = await this.prisma.webhookEndpoint.findFirst({
      where: { id: endpointId, tenantId },
    });
    if (!ep) throw AppError.from('WEBHOOK_NOT_FOUND');

    await this.prisma.webhookEndpoint.delete({ where: { id: endpointId } });
  }

  async getActiveEndpointsForEvent(tenantId: string, eventType: string) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { tenantId, status: 'WH_ACTIVE' },
    });
    return endpoints.filter(ep => ep.events.includes(eventType));
  }

  getAvailableEvents() {
    return AVAILABLE_WEBHOOK_EVENTS;
  }
}
