import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/working-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
import { CalendarSyncService } from '../../../customer/calendar/calendar-sync.service';
import {
  NotificationDispatchService,
  DispatchEvent,
} from '../../../core/work/notifications/services/notification-dispatch.service';

// ─── 1. Process Event Reminders ─────────────────────────────────

/**
 * Find ScheduledEvents approaching their start time within the
 * configured reminder window and dispatch reminder notifications.
 */
@Injectable()
export class ProcessEventRemindersHandler implements ICronJobHandler {
  readonly jobCode = 'PROCESS_EVENT_REMINDERS';
  private readonly logger = new Logger(ProcessEventRemindersHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationDispatch: NotificationDispatchService,
  ) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();
    let processed = 0;

    // Find events with reminders that haven't been sent yet
    const events = await this.prisma.scheduledEvent.findMany({
      where: {
        isActive: true,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
        startTime: { gt: now },
        NOT: { reminderMinutes: { equals: Prisma.DbNull } },
      },
      include: {
        participants: { select: { userId: true } },
      },
      take: 200,
    });

    for (const event of events) {
      try {
        const reminderMinutes = event.reminderMinutes as number[] | null;
        if (!reminderMinutes || !Array.isArray(reminderMinutes)) continue;

        const diffMinutes = (event.startTime.getTime() - now.getTime()) / 60000;

        for (const minutes of reminderMinutes) {
          // Check if event is within this reminder window (within 1 minute tolerance)
          if (diffMinutes <= minutes && diffMinutes > minutes - 1) {
            // Dispatch reminder notification for the organizer
            const dispatchEvent: DispatchEvent = {
              tenantId: event.tenantId,
              eventType: 'ACTIVITY_REMINDER',
              entityType: 'scheduled_event',
              entityId: event.id,
              actorId: event.organizerId,
              data: {
                reminderTitle: event.title,
                eventTitle: event.title,
                startTime: event.startTime.toISOString(),
                minutesUntilStart: Math.round(diffMinutes),
              },
            };

            await this.notificationDispatch.dispatch(dispatchEvent);
            processed++;
            break; // Only one reminder per event per run
          }
        }
      } catch (error) {
        this.logger.error(
          `Failed to process reminder for event ${event.id}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return { recordsProcessed: processed };
  }
}

// ─── 2. Sync External Calendars ─────────────────────────────────

/**
 * Find all ACTIVE UserCalendarSync records and trigger sync
 * for each (inbound + outbound).
 */
@Injectable()
export class SyncExternalCalendarsHandler implements ICronJobHandler {
  readonly jobCode = 'SYNC_EXTERNAL_CALENDARS';
  private readonly logger = new Logger(SyncExternalCalendarsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarSyncService: CalendarSyncService,
  ) {}

  async execute(): Promise<CronJobResult> {
    const syncs = await this.prisma.userCalendarSync.findMany({
      where: {
        isActive: true,
        status: 'ACTIVE',
        provider: { in: ['GOOGLE', 'OUTLOOK'] },
      },
      take: 100,
    });

    let processed = 0;
    let failed = 0;

    for (const sync of syncs) {
      try {
        await this.calendarSyncService.triggerSync(
          sync.userId,
          sync.tenantId,
          sync.provider as 'GOOGLE' | 'OUTLOOK',
        );
        processed++;
      } catch (error) {
        this.logger.error(
          `External sync failed for user ${sync.userId} / ${sync.provider}: ${error instanceof Error ? error.message : error}`,
        );
        failed++;
      }
    }

    return { recordsProcessed: syncs.length, recordsSucceeded: processed, recordsFailed: failed };
  }
}

// ─── 3. Renew Calendar Webhooks ─────────────────────────────────

/**
 * Find UserCalendarSync records where webhookExpiry is within the
 * next 24 hours and log that renewal is needed (stub).
 */
@Injectable()
export class RenewCalendarWebhooksHandler implements ICronJobHandler {
  readonly jobCode = 'RENEW_CALENDAR_WEBHOOKS';
  private readonly logger = new Logger(RenewCalendarWebhooksHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const expiring = await this.prisma.userCalendarSync.findMany({
      where: {
        isActive: true,
        status: 'ACTIVE',
        webhookId: { not: null },
        webhookExpiry: { lt: twentyFourHoursFromNow },
      },
    });

    for (const sync of expiring) {
      this.logger.warn(
        `Webhook renewal needed for user ${sync.userId} / ${sync.provider} ` +
        `(expires: ${sync.webhookExpiry?.toISOString()}). Stub: renewal not yet implemented.`,
      );
    }

    return {
      recordsProcessed: expiring.length,
      details: { message: 'Webhook renewal is a stub — pending provider API integration' },
    };
  }
}

// ─── 4. Auto-Complete Past Events ───────────────────────────────

/**
 * Find ScheduledEvents where endTime has passed and status is still
 * active (SCHEDULED, CONFIRMED, IN_PROGRESS). Mark them COMPLETED.
 */
@Injectable()
export class AutoCompletePastEventsHandler implements ICronJobHandler {
  readonly jobCode = 'AUTO_COMPLETE_PAST_EVENTS';
  private readonly logger = new Logger(AutoCompletePastEventsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();

    const result = await this.prisma.scheduledEvent.updateMany({
      where: {
        isActive: true,
        endTime: { lt: now },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      data: { status: 'COMPLETED' },
    });

    if (result.count > 0) {
      this.logger.log(`Auto-completed ${result.count} past events`);
    }

    return { recordsProcessed: result.count };
  }
}

// ─── 5. Generate Recurring Events ───────────────────────────────

/**
 * Find ScheduledEvents with a recurrence pattern and generate
 * child events for the next 30 days.
 */
@Injectable()
export class GenerateRecurringEventsHandler implements ICronJobHandler {
  readonly jobCode = 'GENERATE_RECURRING_EVENTS';
  private readonly logger = new Logger(GenerateRecurringEventsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const recurringEvents = await this.prisma.scheduledEvent.findMany({
      where: {
        isActive: true,
        recurrencePattern: { not: 'NONE' },
        parentEventId: null, // Only root events
      },
      take: 100,
    });

    let created = 0;

    for (const event of recurringEvents) {
      try {
        // Find the latest child event to determine the next occurrence date
        const latestChild = await this.prisma.scheduledEvent.findFirst({
          where: { parentEventId: event.id, isActive: true },
          orderBy: { startTime: 'desc' },
        });

        const lastStart = latestChild ? latestChild.startTime : event.startTime;
        const duration = event.endTime.getTime() - event.startTime.getTime();

        let nextStart = this.calculateNextDate(lastStart, event.recurrencePattern);
        if (!nextStart) continue;

        // Generate events until we pass 30 days from now
        while (nextStart <= thirtyDaysFromNow) {
          // Check if this occurrence already exists
          const exists = await this.prisma.scheduledEvent.findFirst({
            where: {
              parentEventId: event.id,
              startTime: nextStart,
              isActive: true,
            },
          });

          if (!exists) {
            const count = await this.prisma.scheduledEvent.count({
              where: { tenantId: event.tenantId },
            });
            const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;

            await this.prisma.scheduledEvent.create({
              data: {
                tenantId: event.tenantId,
                eventNumber,
                type: event.type,
                title: event.title,
                description: event.description,
                location: event.location,
                meetingLink: event.meetingLink,
                startTime: nextStart,
                endTime: new Date(nextStart.getTime() + duration),
                allDay: event.allDay,
                timezone: event.timezone,
                color: event.color,
                reminderMinutes: event.reminderMinutes ?? Prisma.JsonNull,
                organizerId: event.organizerId,
                createdById: event.createdById,
                parentEventId: event.id,
                recurrencePattern: 'NONE', // Child events are non-recurring
              },
            });
            created++;
          }

          nextStart = this.calculateNextDate(nextStart, event.recurrencePattern);
          if (!nextStart) break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to generate recurring events for ${event.id}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    this.logger.log(`Generated ${created} recurring event occurrences`);
    return { recordsProcessed: recurringEvents.length, recordsSucceeded: created };
  }

  private calculateNextDate(fromDate: Date, pattern: string): Date | null {
    const next = new Date(fromDate);
    switch (pattern) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKDAYS': {
        next.setDate(next.getDate() + 1);
        // Skip weekends
        while (next.getDay() === 0 || next.getDay() === 6) {
          next.setDate(next.getDate() + 1);
        }
        break;
      }
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'MONTHLY_NTH':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        return null;
    }
    return next;
  }
}
