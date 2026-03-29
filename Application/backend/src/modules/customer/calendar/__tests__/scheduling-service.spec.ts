import { SchedulingService } from '../services/scheduling.service';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prisma: any;
  let calendarSync: any;
  let notifications: any;
  let visibility: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  const mockEvent = {
    id: 'evt-1',
    tenantId,
    eventNumber: 'EVT-0001',
    type: 'MEETING',
    title: 'Team Standup',
    description: 'Daily sync',
    location: 'Room A',
    meetingLink: null,
    startTime: new Date('2025-06-15T10:00:00Z'),
    endTime: new Date('2025-06-15T11:00:00Z'),
    allDay: false,
    timezone: 'Asia/Kolkata',
    color: null,
    status: 'SCHEDULED',
    organizerId: userId,
    createdById: userId,
    isActive: true,
  };

  beforeEach(() => {
    prisma = {
      scheduledEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(mockEvent),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'evt-new', ...args.data }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ ...mockEvent, ...args.data }),
        ),
        count: jest.fn().mockResolvedValue(5),
      },
      eventParticipant: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue({ id: 'ep-1', eventId: 'evt-1', userId }),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'ep-new', ...args.data }),
        ),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      eventHistory: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'eh-new', ...args.data }),
        ),
      },
    };
(prisma as any).working = prisma;

    calendarSync = {
      syncEvent: jest.fn().mockResolvedValue(undefined),
      removeEvent: jest.fn().mockResolvedValue(undefined),
    };

    notifications = {
      dispatch: jest.fn().mockResolvedValue({ dispatched: 1, skipped: 0 }),
    };

    visibility = {
      buildWhereClause: jest.fn().mockResolvedValue({ tenantId }),
    };

    service = new SchedulingService(prisma, calendarSync, notifications, visibility);
  });

  it('should create event with auto-generated event number', async () => {
    prisma.scheduledEvent.count.mockResolvedValue(5);

    const dto = {
      type: 'MEETING',
      title: 'New Meeting',
      description: 'A meeting',
      startTime: '2025-06-20T10:00:00Z',
      endTime: '2025-06-20T11:00:00Z',
    };

    const result = await service.createEvent(dto, userId, tenantId, 0);

    expect(prisma.scheduledEvent.create).toHaveBeenCalled();
    const createArgs = prisma.scheduledEvent.create.mock.calls[0][0];
    expect(createArgs.data.eventNumber).toBe('EVT-0006');
    expect(createArgs.data.eventNumber).toMatch(/^EVT-\d{4}$/);
  });

  it('should add organizer as participant on create', async () => {
    const dto = {
      type: 'MEETING',
      title: 'Team Sync',
      startTime: '2025-06-20T10:00:00Z',
      endTime: '2025-06-20T11:00:00Z',
    };

    await service.createEvent(dto, userId, tenantId, 0);

    expect(prisma.eventParticipant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          role: 'ORGANIZER',
          rsvpStatus: 'ACCEPTED',
        }),
      }),
    );
  });

  it('should cancel event and notify participants', async () => {
    prisma.eventParticipant.findMany.mockResolvedValue([
      { userId: 'user-2' },
      { userId: 'user-3' },
    ]);

    const result = await service.cancelEvent('evt-1', 'Schedule conflict', userId, tenantId);

    // Verify event status updated to CANCELLED
    expect(prisma.scheduledEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-1' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          isActive: false,
        }),
      }),
    );

    // Verify history recorded
    expect(prisma.eventHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'CANCELLED',
          newValue: 'CANCELLED',
        }),
      }),
    );

    // Verify notifications dispatched for participants
    expect(notifications.dispatch).toHaveBeenCalled();
  });

  it('should reschedule and reset RSVPs', async () => {
    const newStart = '2025-06-22T14:00:00Z';
    const newEnd = '2025-06-22T15:00:00Z';

    await service.rescheduleEvent('evt-1', newStart, newEnd, userId, tenantId);

    // Verify times updated
    expect(prisma.scheduledEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-1' },
        data: expect.objectContaining({
          startTime: new Date(newStart),
          endTime: new Date(newEnd),
          status: 'RESCHEDULED',
        }),
      }),
    );

    // Verify all non-organizer participants RSVP reset to PENDING
    expect(prisma.eventParticipant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'evt-1', role: { not: 'ORGANIZER' } },
        data: { rsvpStatus: 'PENDING', rsvpAt: null },
      }),
    );

    // Verify calendar sync and notification dispatched
    expect(calendarSync.syncEvent).toHaveBeenCalled();
    expect(notifications.dispatch).toHaveBeenCalled();
  });

  it('should update RSVP status', async () => {
    prisma.eventParticipant.findFirst.mockResolvedValue({
      id: 'ep-1',
      eventId: 'evt-1',
      userId,
      rsvpStatus: 'PENDING',
    });

    await service.updateRSVP('evt-1', userId, 'ACCEPTED', tenantId);

    expect(prisma.eventParticipant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ep-1' },
        data: expect.objectContaining({
          rsvpStatus: 'ACCEPTED',
        }),
      }),
    );
  });

  it('should record event history on update', async () => {
    const dto = {
      title: 'Updated Meeting Title',
      location: 'Room B',
    };

    await service.updateEvent('evt-1', dto, userId, tenantId);

    // Verify eventHistory.create called for field changes
    expect(prisma.eventHistory.create).toHaveBeenCalled();
    const historyCall = prisma.eventHistory.create.mock.calls[0][0];
    expect(historyCall.data.action).toBe('UPDATED');
    expect(historyCall.data.eventId).toBe('evt-1');
    expect(historyCall.data.changedById).toBe(userId);
  });
});
