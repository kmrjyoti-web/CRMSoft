import { BusinessHoursService } from '../services/business-hours.service';
import { DayOfWeek } from '@prisma/client';

const mockPrisma = {
  businessHoursSchedule: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn() },
  holidayCalendar: { count: jest.fn() },
  $transaction: jest.fn(),
} as any;

describe('BusinessHoursService', () => {
  let service: BusinessHoursService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BusinessHoursService(mockPrisma);
  });

  it('should return true when within working hours on a working day', async () => {
    const now = new Date();
    const dayMap: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as any;
    const today = dayMap[now.getDay()];

    mockPrisma.holidayCalendar.count.mockResolvedValue(0);
    mockPrisma.businessHoursSchedule.findUnique.mockResolvedValue({
      isWorkingDay: true,
      startTime: '00:00',
      endTime: '23:59',
      breakStartTime: null,
      breakEndTime: null,
    });

    const result = await service.isWorkingNow('t1');
    expect(result).toBe(true);
  });

  it('should return false on a non-working day (Sunday)', async () => {
    mockPrisma.holidayCalendar.count.mockResolvedValue(0);
    mockPrisma.businessHoursSchedule.findUnique.mockResolvedValue({
      isWorkingDay: false,
    });

    const result = await service.isWorkingNow('t1');
    expect(result).toBe(false);
  });

  it('should return false during lunch break', async () => {
    mockPrisma.holidayCalendar.count.mockResolvedValue(0);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    mockPrisma.businessHoursSchedule.findUnique.mockResolvedValue({
      isWorkingDay: true,
      startTime: '00:00',
      endTime: '23:59',
      breakStartTime: `${hh}:00`,
      breakEndTime: `${hh}:59`,
    });

    const result = await service.isWorkingNow('t1');
    expect(result).toBe(false);
  });

  it('should return false on a holiday', async () => {
    mockPrisma.holidayCalendar.count.mockResolvedValue(1);

    const result = await service.isWorkingNow('t1');
    expect(result).toBe(false);
  });

  it('should calculate working hours skipping weekends and holidays', async () => {
    // Mock: Mon-Fri working (9-18, 1hr break = 8hrs/day), Sat-Sun off
    mockPrisma.businessHoursSchedule.findUnique.mockImplementation(async ({ where }: any) => {
      const day = where.tenantId_dayOfWeek.dayOfWeek;
      const isWork = !['SUNDAY', 'SATURDAY'].includes(day);
      return {
        isWorkingDay: isWork,
        startTime: isWork ? '09:00' : null,
        endTime: isWork ? '18:00' : null,
        breakStartTime: isWork ? '13:00' : null,
        breakEndTime: isWork ? '14:00' : null,
      };
    });
    mockPrisma.holidayCalendar.count.mockResolvedValue(0);

    const from = new Date('2026-03-02'); // Monday
    const to = new Date('2026-03-06');   // Friday (4 work days)
    const hours = await service.calculateWorkingHours('t1', from, to);
    expect(hours).toBe(32); // 4 days × 8 hours
  });
});
