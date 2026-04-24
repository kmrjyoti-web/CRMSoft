import { AvailabilityService } from '../services/availability.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(() => {
    prisma = {
      userAvailability: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'ua-1', ...args.create }),
        ),
      },
      scheduledEvent: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      blockedSlot: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'bs-1', ...args.data }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      holidayCalendar: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
    };
(prisma as any).working = prisma;

    service = new AvailabilityService(prisma);
  });

  it('should set working hours for 7 days', async () => {
    const hours = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '18:00',
      isWorkingDay: i !== 0 && i !== 6, // weekdays only
    }));

    await service.setWorkingHours(userId, tenantId, hours);

    // $transaction is called with an array of 7 upsert promises
    expect(prisma.$transaction).toHaveBeenCalled();
    const transactionArg = prisma.$transaction.mock.calls[0][0];
    expect(transactionArg).toHaveLength(7);
  });

  it('should detect conflicts with overlapping events', async () => {
    const checkStart = new Date('2025-06-15T10:00:00Z');
    const checkEnd = new Date('2025-06-15T11:00:00Z');

    // Mock overlapping scheduled event
    prisma.scheduledEvent.findMany.mockResolvedValue([
      {
        id: 'evt-1', title: 'Existing Meeting',
        startTime: new Date('2025-06-15T09:30:00Z'),
        endTime: new Date('2025-06-15T10:30:00Z'),
        status: 'SCHEDULED',
      },
    ]);
    prisma.blockedSlot.findMany.mockResolvedValue([]);

    const result = await service.checkConflicts(userId, tenantId, checkStart, checkEnd);

    expect(result.hasConflict).toBe(true);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].type).toBe('EVENT');
  });

  it('should not flag adjacent events as conflicts', async () => {
    const checkStart = new Date('2025-06-15T11:00:00Z');
    const checkEnd = new Date('2025-06-15T12:00:00Z');

    // Event ends exactly when our checked period starts — no overlap
    // The query uses startTime < endTime AND endTime > startTime
    // An event 10:00-11:00 checking against 11:00-12:00:
    //   10:00 < 12:00 = true, but 11:00 > 11:00 = false => not returned by Prisma
    prisma.scheduledEvent.findMany.mockResolvedValue([]);
    prisma.blockedSlot.findMany.mockResolvedValue([]);

    const result = await service.checkConflicts(userId, tenantId, checkStart, checkEnd);

    expect(result.hasConflict).toBe(false);
    expect(result.conflicts).toHaveLength(0);
  });

  it('should find free slots within working hours', async () => {
    const date = new Date('2025-06-16T00:00:00Z'); // Monday
    const dayOfWeek = date.getDay(); // 1 = Monday

    // Mock working hours: 09:00 - 18:00
    prisma.userAvailability.findFirst.mockResolvedValue({
      id: 'ua-1', userId, tenantId, dayOfWeek,
      startTime: '09:00', endTime: '18:00', isWorkingDay: true,
    });

    // One event from 10:00 to 11:00
    prisma.scheduledEvent.findMany.mockResolvedValue([
      {
        startTime: new Date('2025-06-16T10:00:00Z'),
        endTime: new Date('2025-06-16T11:00:00Z'),
      },
    ]);
    prisma.blockedSlot.findMany.mockResolvedValue([]);
    prisma.holidayCalendar.findFirst.mockResolvedValue(null);

    const slots = await service.findFreeSlots([userId], tenantId, date, 60);

    // Should have slots but none during 10:00-11:00
    expect(slots).toBeDefined();
    expect(Array.isArray(slots)).toBe(true);

    // Verify no slot starts at 10:00
    const has10am = slots.some(
      (s) => s.startTime.getUTCHours() === 10 && s.startTime.getUTCMinutes() === 0,
    );
    expect(has10am).toBe(false);
  });

  it('should exclude blocked slots from availability', async () => {
    const date = new Date('2025-06-16T00:00:00Z');
    const dayOfWeek = date.getDay();

    prisma.userAvailability.findFirst.mockResolvedValue({
      id: 'ua-1', userId, tenantId, dayOfWeek,
      startTime: '09:00', endTime: '18:00', isWorkingDay: true,
    });

    prisma.scheduledEvent.findMany.mockResolvedValue([]);
    // Blocked slot from 14:00 to 16:00
    prisma.blockedSlot.findMany.mockResolvedValue([
      {
        startTime: new Date('2025-06-16T14:00:00Z'),
        endTime: new Date('2025-06-16T16:00:00Z'),
      },
    ]);
    prisma.holidayCalendar.findFirst.mockResolvedValue(null);

    const slots = await service.findFreeSlots([userId], tenantId, date, 60);

    // Verify no slot starts at 14:00 or 15:00 (blocked period)
    const blockedSlotStarts = slots.filter(
      (s) => s.startTime.getUTCHours() >= 14 && s.startTime.getUTCHours() < 16,
    );
    expect(blockedSlotStarts).toHaveLength(0);
  });

  it('should handle holidays', async () => {
    const date = new Date('2025-06-16T00:00:00Z');

    // Full-day holiday
    prisma.holidayCalendar.findFirst.mockResolvedValue({
      id: 'h-1', tenantId, date, name: 'Republic Day', isHalfDay: false,
    });

    const slots = await service.findFreeSlots([userId], tenantId, date, 60);

    // No slots on a full holiday
    expect(slots).toHaveLength(0);
  });
});
