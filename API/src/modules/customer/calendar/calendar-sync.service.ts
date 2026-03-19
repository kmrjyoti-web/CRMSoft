import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CalendarEventInput } from '../../../common/interfaces/calendar-event.interface';
import { CalendarProviderAdapter } from './adapters/calendar-provider.adapter';
import { GoogleCalendarAdapter } from './adapters/google-calendar.adapter';
import { OutlookCalendarAdapter } from './adapters/outlook-calendar.adapter';

@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);
  private readonly adapters = new Map<string, CalendarProviderAdapter>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAdapter: GoogleCalendarAdapter,
    private readonly outlookAdapter: OutlookCalendarAdapter,
  ) {
    this.adapters.set('GOOGLE', this.googleAdapter);
    this.adapters.set('OUTLOOK', this.outlookAdapter);
  }

  // ─── Existing Methods (unchanged) ─────────────────────────────

  async syncEvent(input: CalendarEventInput) {
    const existing = await this.prisma.working.calendarEvent.findFirst({
      where: { eventType: input.eventType, sourceId: input.sourceId },
    });
    if (existing) {
      return this.prisma.working.calendarEvent.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay || false,
          color: input.color,
        },
      });
    } else {
      return this.prisma.working.calendarEvent.create({
        data: {
          eventType: input.eventType,
          sourceId: input.sourceId,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay || false,
          color: input.color,
          userId: input.userId,
        },
      });
    }
  }

  async removeEvent(eventType: string, sourceId: string) {
    await this.prisma.working.calendarEvent.updateMany({
      where: { eventType, sourceId },
      data: { isActive: false },
    });
  }

  // ─── External Sync Methods ────────────────────────────────────

  /**
   * Connect an external calendar provider for a user.
   * Creates or updates the UserCalendarSync record.
   */
  async connectProvider(
    userId: string,
    tenantId: string,
    provider: 'GOOGLE' | 'OUTLOOK',
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    calendarId: string,
    externalEmail: string,
  ) {
    const sync = await this.prisma.working.userCalendarSync.upsert({
      where: {
        tenantId_userId_provider: { tenantId, userId, provider },
      },
      update: {
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        calendarId,
        externalEmail,
        status: 'ACTIVE',
        errorMessage: null,
        isActive: true,
      },
      create: {
        tenantId,
        userId,
        provider,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        calendarId,
        externalEmail,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Connected ${provider} calendar for user ${userId}`);
    return sync;
  }

  /**
   * Disconnect an external calendar provider for a user.
   */
  async disconnectProvider(
    userId: string,
    tenantId: string,
    provider: 'GOOGLE' | 'OUTLOOK',
  ) {
    await this.prisma.working.userCalendarSync.updateMany({
      where: { tenantId, userId, provider },
      data: {
        status: 'DISCONNECTED',
        isActive: false,
        accessToken: null,
        refreshToken: null,
        syncToken: null,
      },
    });
    this.logger.log(`Disconnected ${provider} calendar for user ${userId}`);
  }

  /**
   * Trigger a full sync (inbound + outbound) for a specific provider.
   */
  async triggerSync(
    userId: string,
    tenantId: string,
    provider: 'GOOGLE' | 'OUTLOOK',
  ) {
    const sync = await this.prisma.working.userCalendarSync.findUnique({
      where: {
        tenantId_userId_provider: { tenantId, userId, provider },
      },
    });

    if (!sync || !sync.isActive || sync.status !== 'ACTIVE') {
      this.logger.warn(`No active sync found for user ${userId} / ${provider}`);
      return { inbound: 0, outbound: 0 };
    }

    let inbound = 0;
    let outbound = 0;

    try {
      inbound = await this.syncInbound(sync);
      outbound = await this.syncOutbound(sync);

      await this.prisma.working.userCalendarSync.update({
        where: { id: sync.id },
        data: { lastSyncAt: new Date(), errorMessage: null },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Sync failed for ${provider}: ${message}`);
      await this.prisma.working.userCalendarSync.update({
        where: { id: sync.id },
        data: { errorMessage: message, status: 'ERROR' },
      });
    }

    return { inbound, outbound };
  }

  /**
   * Get all sync configurations for a user.
   */
  async getSyncStatus(userId: string, tenantId: string) {
    return this.prisma.working.userCalendarSync.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Inbound sync: fetch events from external calendar and create/update
   * ScheduledEvents in the CRM.
   */
  async syncInbound(sync: {
    id: string;
    tenantId: string;
    userId: string;
    provider: string;
    accessToken: string | null;
    calendarId: string | null;
    syncToken: string | null;
  }): Promise<number> {
    const adapter = this.adapters.get(sync.provider);
    if (!adapter || !sync.accessToken || !sync.calendarId) {
      this.logger.warn(`Cannot sync inbound: missing adapter or credentials for ${sync.provider}`);
      return 0;
    }

    const { events, nextSyncToken } = await adapter.listEvents(
      sync.accessToken,
      sync.calendarId,
      sync.syncToken || undefined,
    );

    let processed = 0;
    for (const ext of events) {
      const existing = await this.prisma.working.scheduledEvent.findFirst({
        where: {
          tenantId: sync.tenantId,
          externalEventId: ext.id,
          syncProvider: sync.provider as any,
        },
      });

      if (existing) {
        await this.prisma.working.scheduledEvent.update({
          where: { id: existing.id },
          data: {
            title: ext.title,
            description: ext.description,
            startTime: ext.startTime,
            endTime: ext.endTime,
            allDay: ext.allDay ?? false,
            location: ext.location,
          },
        });
      } else {
        const count = await this.prisma.working.scheduledEvent.count({
          where: { tenantId: sync.tenantId },
        });
        const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;

        await this.prisma.working.scheduledEvent.create({
          data: {
            tenantId: sync.tenantId,
            eventNumber,
            type: 'OTHER',
            title: ext.title,
            description: ext.description,
            startTime: ext.startTime,
            endTime: ext.endTime,
            allDay: ext.allDay ?? false,
            location: ext.location,
            organizerId: sync.userId,
            createdById: sync.userId,
            externalEventId: ext.id,
            syncProvider: sync.provider as any,
          },
        });
      }
      processed++;
    }

    // Persist the new sync token for incremental sync
    if (nextSyncToken) {
      await this.prisma.working.userCalendarSync.update({
        where: { id: sync.id },
        data: { syncToken: nextSyncToken },
      });
    }

    this.logger.log(`Inbound sync: ${processed} events from ${sync.provider}`);
    return processed;
  }

  /**
   * Outbound sync: push CRM ScheduledEvents that don't have an externalEventId
   * to the external calendar.
   */
  async syncOutbound(sync: {
    id: string;
    tenantId: string;
    userId: string;
    provider: string;
    accessToken: string | null;
    calendarId: string | null;
    lastSyncAt: Date | null;
  }): Promise<number> {
    const adapter = this.adapters.get(sync.provider);
    if (!adapter || !sync.accessToken || !sync.calendarId) {
      this.logger.warn(`Cannot sync outbound: missing adapter or credentials for ${sync.provider}`);
      return 0;
    }

    // Find CRM events that haven't been synced to this provider
    const events = await this.prisma.working.scheduledEvent.findMany({
      where: {
        tenantId: sync.tenantId,
        organizerId: sync.userId,
        isActive: true,
        status: { notIn: ['CANCELLED'] },
        externalEventId: null,
        // Only sync events modified after last sync
        ...(sync.lastSyncAt ? { updatedAt: { gte: sync.lastSyncAt } } : {}),
      },
      take: 100,
    });

    let pushed = 0;
    for (const event of events) {
      try {
        const externalId = await adapter.createEvent(
          sync.accessToken,
          sync.calendarId,
          {
            title: event.title,
            description: event.description || undefined,
            startTime: event.startTime,
            endTime: event.endTime,
            allDay: event.allDay,
            location: event.location || undefined,
          },
        );

        await this.prisma.working.scheduledEvent.update({
          where: { id: event.id },
          data: {
            externalEventId: externalId,
            syncProvider: sync.provider as any,
          },
        });
        pushed++;
      } catch (error) {
        this.logger.warn(
          `Failed to push event ${event.id} to ${sync.provider}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    this.logger.log(`Outbound sync: ${pushed} events to ${sync.provider}`);
    return pushed;
  }

  /**
   * Handle an incoming webhook from an external provider.
   * Triggers an incremental sync for the affected user.
   */
  async handleWebhook(provider: string, payload: Record<string, any>) {
    this.logger.log(`Received webhook from ${provider}: ${JSON.stringify(payload).slice(0, 200)}`);

    // Find the sync record based on webhook data
    // The exact payload structure depends on the provider
    const channelId = payload.channelId || payload.subscriptionId;
    if (!channelId) {
      this.logger.warn(`Webhook from ${provider} missing channel/subscription ID`);
      return;
    }

    const sync = await this.prisma.working.userCalendarSync.findFirst({
      where: { provider: provider as any, webhookId: channelId, isActive: true },
    });

    if (sync) {
      await this.triggerSync(sync.userId, sync.tenantId, provider as any);
    } else {
      this.logger.warn(`No sync record found for webhook channel ${channelId}`);
    }
  }
}
