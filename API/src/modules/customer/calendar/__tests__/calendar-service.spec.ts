import { CalendarService } from '../calendar.service';
import { CalendarSyncService } from '../calendar-sync.service';

describe('CalendarService', () => {
  let service: CalendarService;
  let syncService: CalendarSyncService;
  let prisma: any;

  const tenantId = 'tenant-1';

  const mockEvents = [
    { id: 'ce-1', eventType: 'ACTIVITY', title: 'Call', startTime: new Date(), userId: 'user-1', isActive: true },
    { id: 'ce-2', eventType: 'DEMO', title: 'Demo', startTime: new Date(), userId: 'user-1', isActive: true },
  ];

  beforeEach(() => {
    prisma = {
      calendarEvent: {
        findMany: jest.fn().mockResolvedValue(mockEvents),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(mockEvents[0]),
        update: jest.fn().mockResolvedValue(mockEvents[0]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
(prisma as any).working = prisma;
    service = new CalendarService(prisma);
    syncService = new CalendarSyncService(prisma, {} as any, {} as any);
  });

  it('should get calendar events for a user within date range', async () => {
    const result = await service.getCalendarEvents(tenantId, 'user-1', new Date('2025-01-01'), new Date('2025-01-31'));
    expect(prisma.calendarEvent.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('should filter by event types', async () => {
    prisma.calendarEvent.findMany.mockResolvedValue([mockEvents[0]]);
    const result = await service.getCalendarEvents(tenantId, 'user-1', new Date('2025-01-01'), new Date('2025-01-31'), ['ACTIVITY']);
    expect(result).toHaveLength(1);
  });

  it('should get team calendar for multiple users', async () => {
    prisma.calendarEvent.findMany.mockResolvedValue(mockEvents.map((e) => ({ ...e, user: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' } })));
    const result = await service.getTeamCalendar(tenantId, ['user-1', 'user-2'], new Date('2025-01-01'), new Date('2025-01-31'));
    expect(result).toHaveLength(2);
  });

  it('should get availability with busy slots', async () => {
    const result = await service.getAvailability(tenantId, 'user-1', new Date('2025-01-15'));
    expect(result.busySlots).toHaveLength(2);
    expect(result.totalEvents).toBe(2);
  });

  it('should get day view', async () => {
    const result = await service.getDayView(tenantId, 'user-1', new Date('2025-01-15'));
    expect(prisma.calendarEvent.findMany).toHaveBeenCalled();
  });

  it('should get month view', async () => {
    const result = await service.getMonthView(tenantId, 'user-1', 2025, 1);
    expect(prisma.calendarEvent.findMany).toHaveBeenCalled();
  });

  it('should sync a calendar event via findFirst + create', async () => {
    await syncService.syncEvent({
      eventType: 'ACTIVITY', sourceId: 'act-1', title: 'Call',
      startTime: new Date(), userId: 'user-1',
    });
    expect(prisma.calendarEvent.findFirst).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
  });

  it('should remove a calendar event by soft delete', async () => {
    await syncService.removeEvent('ACTIVITY', 'act-1');
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });
});
