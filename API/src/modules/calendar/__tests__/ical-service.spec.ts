import { ICalService } from '../services/ical.service';

describe('ICalService', () => {
  let service: ICalService;
  let prisma: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(() => {
    prisma = {
      scheduledEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'se-new', ...args.data }),
        ),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    service = new ICalService(prisma);
  });

  it('should export valid .ics format', async () => {
    const now = new Date('2025-06-15T10:00:00Z');

    prisma.scheduledEvent.findMany.mockResolvedValue([
      {
        id: 'evt-1',
        title: 'Team Meeting',
        description: 'Weekly sync',
        location: 'Room A',
        startTime: now,
        endTime: new Date(now.getTime() + 3600000),
        allDay: false,
        status: 'SCHEDULED',
        createdAt: now,
      },
      {
        id: 'evt-2',
        title: 'All Day Review',
        description: null,
        location: null,
        startTime: new Date('2025-06-16T00:00:00Z'),
        endTime: new Date('2025-06-17T00:00:00Z'),
        allDay: true,
        status: 'CONFIRMED',
        createdAt: now,
      },
    ]);

    const ics = await service.exportToIcs(
      userId, tenantId,
      new Date('2025-06-01'), new Date('2025-06-30'),
    );

    // Verify valid iCal structure
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//CRM-SOFT//Calendar//EN');

    // Verify event data
    expect(ics).toContain('SUMMARY:Team Meeting');
    expect(ics).toContain('DESCRIPTION:Weekly sync');
    expect(ics).toContain('LOCATION:Room A');
    expect(ics).toContain('UID:evt-1@crm-soft');
    expect(ics).toContain('UID:evt-2@crm-soft');
  });

  it('should import .ics and create scheduled events', async () => {
    prisma.scheduledEvent.count.mockResolvedValue(0);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Imported Meeting',
      'DTSTART:20250620T100000Z',
      'DTEND:20250620T110000Z',
      'DESCRIPTION:An imported event',
      'LOCATION:Board Room',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:Another Event',
      'DTSTART:20250621T140000Z',
      'DTEND:20250621T150000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const imported = await service.importFromIcs(icsContent, userId, tenantId);

    expect(imported).toBe(2);
    expect(prisma.scheduledEvent.create).toHaveBeenCalledTimes(2);

    const firstCall = prisma.scheduledEvent.create.mock.calls[0][0];
    expect(firstCall.data.title).toBe('Imported Meeting');
    expect(firstCall.data.organizerId).toBe(userId);
    expect(firstCall.data.tenantId).toBe(tenantId);
    expect(firstCall.data.syncProvider).toBe('ICAL');
  });

  it('should generate unique feed token', () => {
    const token = service.generateFeedToken(userId, tenantId);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    // UUID format: 8-4-4-4-12 hex characters
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    // Tokens should be unique
    const token2 = service.generateFeedToken(userId, tenantId);
    expect(token).not.toBe(token2);
  });
});
