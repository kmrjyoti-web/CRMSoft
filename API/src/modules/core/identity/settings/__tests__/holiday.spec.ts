import { HolidayService } from '../services/holiday.service';

const mockPrisma = {
  holidayCalendar: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
} as any;
(mockPrisma as any).identity = mockPrisma;
(mockPrisma as any).platform = mockPrisma;

describe('HolidayService', () => {
  let service: HolidayService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HolidayService(mockPrisma);
  });

  it('should create a holiday', async () => {
    const expected = { id: 'h1', name: 'Republic Day', type: 'NATIONAL' };
    mockPrisma.holidayCalendar.create.mockResolvedValue(expected);

    const result = await service.create('t1', {
      name: 'Republic Day',
      date: '2026-01-26',
      type: 'NATIONAL',
      isRecurring: true,
    });
    expect(result.name).toBe('Republic Day');
    expect(mockPrisma.holidayCalendar.create).toHaveBeenCalled();
  });

  it('should detect a regional holiday for the correct state', async () => {
    mockPrisma.holidayCalendar.findMany.mockResolvedValue([
      { type: 'REGIONAL', applicableStates: ['MH', 'GJ'] },
    ]);

    const isHoliday = await service.isHoliday('t1', new Date(), 'MH');
    expect(isHoliday).toBe(true);
  });

  it('should not match a regional holiday for a different state', async () => {
    mockPrisma.holidayCalendar.findMany.mockResolvedValue([
      { type: 'REGIONAL', applicableStates: ['MH', 'GJ'] },
    ]);

    const isHoliday = await service.isHoliday('t1', new Date(), 'DL');
    expect(isHoliday).toBe(false);
  });
});
