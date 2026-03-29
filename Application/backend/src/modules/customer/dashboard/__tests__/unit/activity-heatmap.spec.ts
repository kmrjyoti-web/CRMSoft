import { ActivityAnalyticsService } from '../../services/activity-analytics.service';

describe('Activity Heatmap', () => {
  let prisma: any;
  let service: ActivityAnalyticsService;

  beforeEach(() => {
    const now = new Date();
    const activities = [
      { createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0), type: 'CALL' },
      { createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30), type: 'CALL' },
      { createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0), type: 'MEETING' },
      { createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0), type: 'EMAIL' },
      { createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 15, 0), type: 'VISIT' },
    ];
    prisma = {
      activity: {
        findMany: jest.fn().mockResolvedValue(activities),
      },
    };
(prisma as any).working = prisma;
    service = new ActivityAnalyticsService(prisma);
  });

  it('should return 7×24 weekly grid', async () => {
    const result = await service.getActivityHeatmap({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.weeklyGrid.data).toHaveLength(7);
    expect(result.weeklyGrid.data[0]).toHaveLength(24);
    expect(result.weeklyGrid.labels.days).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(result.weeklyGrid.labels.hours).toHaveLength(24);
  });

  it('should identify peak and quiet times', async () => {
    const result = await service.getActivityHeatmap({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.weeklyGrid.peakTime).toHaveProperty('day');
    expect(result.weeklyGrid.peakTime).toHaveProperty('hour');
    expect(result.weeklyGrid.peakTime).toHaveProperty('count');
    expect(result.weeklyGrid.quietTime).toBeDefined();
  });

  it('should generate calendar grid with levels 0-4', async () => {
    const result = await service.getActivityHeatmap({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.calendarGrid).toBeDefined();
    for (const entry of result.calendarGrid) {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('count');
      expect(entry).toHaveProperty('level');
      expect(entry.level).toBeGreaterThanOrEqual(0);
      expect(entry.level).toBeLessThanOrEqual(4);
    }
  });

  it('should include summary with breakdown by type and day', async () => {
    const result = await service.getActivityHeatmap({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.summary.totalActivities).toBe(5);
    expect(result.summary.byType).toHaveProperty('CALL');
    expect(result.summary.byType['CALL']).toBe(2);
    expect(result.summary.byDayOfWeek).toHaveProperty('Mon');
    expect(result.summary).toHaveProperty('streakDays');
    expect(result.summary).toHaveProperty('avgPerDay');
  });
});
