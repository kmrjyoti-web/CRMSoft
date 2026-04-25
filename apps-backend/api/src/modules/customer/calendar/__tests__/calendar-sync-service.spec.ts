import { CalendarSyncService } from '../calendar-sync.service';

describe('CalendarSyncService', () => {
  let service: CalendarSyncService;
  let prisma: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(() => {
    prisma = {
      calendarEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'ce-new', ...args.data }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      userCalendarSync: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'ucs-new', ...args.create }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      scheduledEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'se-new', ...args.data }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        count: jest.fn().mockResolvedValue(0),
      },
    };
(prisma as any).working = prisma;

    const googleAdapter = {} as any;
    const outlookAdapter = {} as any;

    service = new CalendarSyncService(prisma, googleAdapter, outlookAdapter);
  });

  it('should connect a provider and create sync record', async () => {
    const expiresAt = new Date('2025-07-01T00:00:00Z');

    const result = await service.connectProvider(
      userId, tenantId, 'GOOGLE',
      'access-token-123', 'refresh-token-456', expiresAt,
      'calendar-id-1', 'user@gmail.com',
    );

    expect(prisma.userCalendarSync.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_userId_provider: { tenantId, userId, provider: 'GOOGLE' },
        },
        create: expect.objectContaining({
          tenantId,
          userId,
          provider: 'GOOGLE',
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(result).toBeDefined();
  });

  it('should disconnect and clear tokens', async () => {
    await service.disconnectProvider(userId, tenantId, 'GOOGLE');

    expect(prisma.userCalendarSync.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId, userId, provider: 'GOOGLE' },
        data: expect.objectContaining({
          status: 'DISCONNECTED',
          isActive: false,
          accessToken: null,
          refreshToken: null,
          syncToken: null,
        }),
      }),
    );
  });

  it('should get sync status for user', async () => {
    const mockSyncs = [
      { id: 'ucs-1', provider: 'GOOGLE', status: 'ACTIVE' },
      { id: 'ucs-2', provider: 'OUTLOOK', status: 'DISCONNECTED' },
    ];
    prisma.userCalendarSync.findMany.mockResolvedValue(mockSyncs);

    const result = await service.getSyncStatus(userId, tenantId);

    expect(prisma.userCalendarSync.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId, userId },
      }),
    );
    expect(result).toHaveLength(2);
  });

  it('should sync event to calendar event table', async () => {
    // No existing calendar event
    prisma.calendarEvent.findFirst.mockResolvedValue(null);

    await service.syncEvent({
      eventType: 'ACTIVITY',
      sourceId: 'act-1',
      title: 'Client Call',
      startTime: new Date('2025-06-15T10:00:00Z'),
      userId,
    });

    expect(prisma.calendarEvent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventType: 'ACTIVITY', sourceId: 'act-1' },
      }),
    );
    expect(prisma.calendarEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'ACTIVITY',
          sourceId: 'act-1',
          title: 'Client Call',
          userId,
        }),
      }),
    );
  });

  it('should remove event via soft delete', async () => {
    await service.removeEvent('ACTIVITY', 'act-1');

    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventType: 'ACTIVITY', sourceId: 'act-1' },
        data: { isActive: false },
      }),
    );
  });
});
