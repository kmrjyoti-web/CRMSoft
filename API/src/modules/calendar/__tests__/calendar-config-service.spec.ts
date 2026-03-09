import { CalendarConfigService } from '../services/calendar-config.service';

describe('CalendarConfigService', () => {
  let service: CalendarConfigService;
  let prisma: any;

  const tenantId = 'tenant-1';

  beforeEach(() => {
    prisma = {
      calendarConfig: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'cc-1', ...args.create }),
        ),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'cc-new', ...args.data }),
        ),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    service = new CalendarConfigService(prisma);
  });

  it('should get config by key', async () => {
    const mockConfig = {
      id: 'cc-1',
      tenantId,
      configKey: 'CALENDAR_DEFAULT_VIEW',
      configValue: { view: 'WEEK', startOfWeek: 1, workingDayStart: '09:00', workingDayEnd: '18:00' },
    };
    prisma.calendarConfig.findUnique.mockResolvedValue(mockConfig);

    const result = await service.getConfig(tenantId, 'CALENDAR_DEFAULT_VIEW');

    expect(prisma.calendarConfig.findUnique).toHaveBeenCalledWith({
      where: { tenantId_configKey: { tenantId, configKey: 'CALENDAR_DEFAULT_VIEW' } },
    });
    expect(result).toEqual(mockConfig.configValue);
    expect(result.view).toBe('WEEK');
    expect(result.startOfWeek).toBe(1);
  });

  it('should upsert config', async () => {
    const configValue = { action: 'BLOCK', allowDoubleBooking: false };

    await service.upsertConfig(
      tenantId,
      'CALENDAR_CONFLICT_POLICY',
      configValue,
      'Conflict policy settings',
      'admin-user-1',
    );

    expect(prisma.calendarConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_configKey: { tenantId, configKey: 'CALENDAR_CONFLICT_POLICY' },
        },
        update: expect.objectContaining({
          configValue,
          description: 'Conflict policy settings',
          updatedById: 'admin-user-1',
        }),
        create: expect.objectContaining({
          tenantId,
          configKey: 'CALENDAR_CONFLICT_POLICY',
          configValue,
          description: 'Conflict policy settings',
          updatedById: 'admin-user-1',
        }),
      }),
    );
  });

  it('should list all configs', async () => {
    const mockConfigs = [
      { id: 'cc-1', configKey: 'CALENDAR_DEFAULT_VIEW', configValue: { view: 'WEEK' }, isActive: true },
      { id: 'cc-2', configKey: 'CALENDAR_EVENT_COLORS', configValue: { TASK: '#4A90D9' }, isActive: true },
      { id: 'cc-3', configKey: 'CALENDAR_SYNC_SETTINGS', configValue: { enableGoogleSync: true }, isActive: true },
    ];
    prisma.calendarConfig.findMany.mockResolvedValue(mockConfigs);

    const result = await service.getAllConfigs(tenantId);

    expect(prisma.calendarConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId, isActive: true },
        orderBy: { configKey: 'asc' },
      }),
    );
    expect(result).toHaveLength(3);
    expect(result[0].configKey).toBe('CALENDAR_DEFAULT_VIEW');
  });
});
