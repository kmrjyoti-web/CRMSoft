import {
  ProcessEventRemindersHandler,
  SyncExternalCalendarsHandler,
  RenewCalendarWebhooksHandler,
  AutoCompletePastEventsHandler,
  GenerateRecurringEventsHandler,
} from '../../cron-engine/handlers/calendar-handlers';

describe('Calendar Cron Handlers', () => {
  // ─── 1. ProcessEventRemindersHandler ─────────────────────────

  describe('ProcessEventRemindersHandler', () => {
    let handler: ProcessEventRemindersHandler;
    let prisma: any;
    let notificationDispatch: any;

    beforeEach(() => {
      prisma = {
        scheduledEvent: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      notificationDispatch = {
        dispatch: jest.fn().mockResolvedValue({ dispatched: 1, skipped: 0 }),
      };

      handler = new ProcessEventRemindersHandler(prisma, notificationDispatch);
    });

    it('should find upcoming events and dispatch reminders', async () => {
      const now = new Date();
      // Event starts 14.5 minutes from now — falls within the 15-minute reminder window
      // Handler checks: diffMinutes <= 15 && diffMinutes > 14 => 14.5 satisfies both
      const withinReminderWindow = new Date(now.getTime() + 14.5 * 60000);

      prisma.scheduledEvent.findMany.mockResolvedValue([
        {
          id: 'evt-1',
          tenantId: 'tenant-1',
          title: 'Upcoming Meeting',
          startTime: withinReminderWindow,
          organizerId: 'user-1',
          reminderMinutes: [15],
          participants: [{ userId: 'user-1' }, { userId: 'user-2' }],
        },
      ]);

      const result = await handler.execute();

      expect(prisma.scheduledEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
          }),
        }),
      );
      expect(notificationDispatch.dispatch).toHaveBeenCalled();
      expect(result.recordsProcessed).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2. SyncExternalCalendarsHandler ─────────────────────────

  describe('SyncExternalCalendarsHandler', () => {
    let handler: SyncExternalCalendarsHandler;
    let prisma: any;
    let calendarSyncService: any;

    beforeEach(() => {
      prisma = {
        userCalendarSync: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      calendarSyncService = {
        triggerSync: jest.fn().mockResolvedValue({ inbound: 2, outbound: 1 }),
      };

      handler = new SyncExternalCalendarsHandler(prisma, calendarSyncService);
    });

    it('should find active syncs and trigger sync', async () => {
      prisma.userCalendarSync.findMany.mockResolvedValue([
        { id: 'ucs-1', userId: 'user-1', tenantId: 'tenant-1', provider: 'GOOGLE', status: 'ACTIVE', isActive: true },
        { id: 'ucs-2', userId: 'user-2', tenantId: 'tenant-1', provider: 'OUTLOOK', status: 'ACTIVE', isActive: true },
      ]);

      const result = await handler.execute();

      expect(prisma.userCalendarSync.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            status: 'ACTIVE',
          }),
        }),
      );
      expect(calendarSyncService.triggerSync).toHaveBeenCalledTimes(2);
      expect(calendarSyncService.triggerSync).toHaveBeenCalledWith('user-1', 'tenant-1', 'GOOGLE');
      expect(calendarSyncService.triggerSync).toHaveBeenCalledWith('user-2', 'tenant-1', 'OUTLOOK');
      expect(result.recordsProcessed).toBe(2);
    });
  });

  // ─── 3. RenewCalendarWebhooksHandler ─────────────────────────

  describe('RenewCalendarWebhooksHandler', () => {
    let handler: RenewCalendarWebhooksHandler;
    let prisma: any;

    beforeEach(() => {
      prisma = {
        userCalendarSync: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      handler = new RenewCalendarWebhooksHandler(prisma);
    });

    it('should find expiring webhooks and log', async () => {
      const soonExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now

      prisma.userCalendarSync.findMany.mockResolvedValue([
        {
          id: 'ucs-1', userId: 'user-1', provider: 'GOOGLE',
          webhookId: 'wh-1', webhookExpiry: soonExpiry, status: 'ACTIVE', isActive: true,
        },
      ]);

      const result = await handler.execute();

      expect(prisma.userCalendarSync.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            status: 'ACTIVE',
            webhookId: { not: null },
          }),
        }),
      );
      expect(result.recordsProcessed).toBe(1);
      expect(result.details).toBeDefined();
    });
  });

  // ─── 4. AutoCompletePastEventsHandler ────────────────────────

  describe('AutoCompletePastEventsHandler', () => {
    let handler: AutoCompletePastEventsHandler;
    let prisma: any;

    beforeEach(() => {
      prisma = {
        scheduledEvent: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      handler = new AutoCompletePastEventsHandler(prisma);
    });

    it('should complete past events', async () => {
      prisma.scheduledEvent.updateMany.mockResolvedValue({ count: 3 });

      const result = await handler.execute();

      expect(prisma.scheduledEvent.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          }),
          data: { status: 'COMPLETED' },
        }),
      );
      expect(result.recordsProcessed).toBe(3);
    });
  });

  // ─── 5. GenerateRecurringEventsHandler ───────────────────────

  describe('GenerateRecurringEventsHandler', () => {
    let handler: GenerateRecurringEventsHandler;
    let prisma: any;

    beforeEach(() => {
      prisma = {
        scheduledEvent: {
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((args) =>
            Promise.resolve({ id: 'se-child', ...args.data }),
          ),
          count: jest.fn().mockResolvedValue(10),
        },
      };

      handler = new GenerateRecurringEventsHandler(prisma);
    });

    it('should create child events for recurring parent', async () => {
      const now = new Date();
      const eventStart = new Date(now);
      eventStart.setDate(eventStart.getDate() - 1); // yesterday
      const eventEnd = new Date(eventStart.getTime() + 3600000);

      prisma.scheduledEvent.findMany.mockResolvedValue([
        {
          id: 'evt-parent',
          tenantId: 'tenant-1',
          eventNumber: 'EVT-0001',
          type: 'MEETING',
          title: 'Weekly Standup',
          description: 'Team standup',
          location: 'Room A',
          meetingLink: null,
          startTime: eventStart,
          endTime: eventEnd,
          allDay: false,
          timezone: 'Asia/Kolkata',
          color: null,
          reminderMinutes: [15],
          organizerId: 'user-1',
          createdById: 'user-1',
          recurrencePattern: 'DAILY',
          parentEventId: null,
          isActive: true,
        },
      ]);

      // No existing latest child
      prisma.scheduledEvent.findFirst.mockResolvedValue(null);

      const result = await handler.execute();

      expect(prisma.scheduledEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            recurrencePattern: { not: 'NONE' },
            parentEventId: null,
          }),
        }),
      );

      // Should create at least one child event for a daily pattern
      expect(prisma.scheduledEvent.create).toHaveBeenCalled();
      const createCall = prisma.scheduledEvent.create.mock.calls[0][0];
      expect(createCall.data.parentEventId).toBe('evt-parent');
      expect(createCall.data.recurrencePattern).toBe('NONE'); // children are non-recurring
      expect(createCall.data.title).toBe('Weekly Standup');
      expect(result.recordsProcessed).toBe(1);
    });
  });
});
