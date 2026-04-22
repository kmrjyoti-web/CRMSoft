import { TargetCalculatorService } from '../../services/target-calculator.service';

describe('Target Calculator Service', () => {
  let prisma: any;
  let service: TargetCalculatorService;

  const now = Date.now();
  const periodStart = new Date(now - 15 * 86400000); // 15 days ago
  const periodEnd = new Date(now + 15 * 86400000);   // 15 days from now

  beforeEach(() => {
    prisma = {
      salesTarget: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'st-1', metric: 'LEADS_WON', targetValue: 100, currentValue: 40,
            achievedPercent: 40, periodStart, periodEnd, userId: 'u-1',
            isActive: true, name: 'Q1 Leads',
          },
          {
            id: 'st-2', metric: 'REVENUE', targetValue: 500000, currentValue: 480000,
            achievedPercent: 96, periodStart, periodEnd, userId: 'u-1',
            isActive: true, name: 'Q1 Revenue',
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'st-1' }),
      },
      lead: {
        count: jest.fn().mockResolvedValue(50),
        aggregate: jest.fn().mockResolvedValue({ _sum: { expectedValue: 480000 } }),
      },
      activity: { count: jest.fn().mockResolvedValue(100) },
      demo: { count: jest.fn().mockResolvedValue(10) },
      quotation: { count: jest.fn().mockResolvedValue(15) },
    };
(prisma as any).working = prisma;
    service = new TargetCalculatorService(prisma);
  });

  it('should recalculate all active targets via CRON', async () => {
    await service.recalculateTargets();
    expect(prisma.salesTarget.update).toHaveBeenCalledTimes(2);
    expect(prisma.salesTarget.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'st-1' },
        data: expect.objectContaining({ lastCalculatedAt: expect.any(Date) }),
      }),
    );
  });

  it('should calculate LEADS_WON metric correctly', async () => {
    prisma.lead.count.mockResolvedValue(42);
    const result = await service.calculateMetric('LEADS_WON', periodStart, periodEnd, 'u-1');
    expect(result).toBe(42);
    expect(prisma.lead.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'WON' }) }),
    );
  });

  it('should calculate REVENUE metric correctly', async () => {
    const result = await service.calculateMetric('REVENUE', periodStart, periodEnd, 'u-1');
    expect(result).toBe(480000);
    expect(prisma.lead.aggregate).toHaveBeenCalled();
  });

  it('should calculate activity-based metrics (CALLS, MEETINGS, VISITS)', async () => {
    prisma.activity.count.mockResolvedValue(25);
    const calls = await service.calculateMetric('CALLS', periodStart, periodEnd, 'u-1');
    expect(calls).toBe(25);
    expect(prisma.activity.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'CALL' }) }),
    );
  });

  it('should return target tracking with status determination', async () => {
    const result = await service.getTargetTracking({});
    expect(result.targets).toHaveLength(2);
    expect(result.targets[0]).toHaveProperty('status');
    expect(result.targets[0]).toHaveProperty('projectedValue');
    expect(result.targets[0]).toHaveProperty('daysLeft');
    expect(result.targets[0]).toHaveProperty('requiredPerDay');
    expect(['EXCEEDED', 'ACHIEVED', 'ON_TRACK', 'AT_RISK', 'BEHIND']).toContain(result.targets[0].status);
  });

  it('should return correct summary counts in target tracking', async () => {
    const result = await service.getTargetTracking({});
    expect(result.summary.totalTargets).toBe(2);
    expect(result.summary.achieved + result.summary.onTrack + result.summary.atRisk + result.summary.behind).toBe(2);
    expect(result.summary).toHaveProperty('overallAchievement');
  });

  describe('error cases', () => {
    it('should return 0 for unknown metric type', async () => {
      const result = await service.calculateMetric('UNKNOWN_METRIC' as any, periodStart, periodEnd, 'u-1');
      expect(result).toBe(0);
    });

    it('should not call salesTarget.update when no active targets', async () => {
      prisma.salesTarget.findMany.mockResolvedValue([]);
      await service.recalculateTargets();
      expect(prisma.salesTarget.update).not.toHaveBeenCalled();
    });

    it('should return empty targets array in getTargetTracking when no targets', async () => {
      prisma.salesTarget.findMany.mockResolvedValue([]);
      const result = await service.getTargetTracking({});
      expect(result.targets).toHaveLength(0);
      expect(result.summary.totalTargets).toBe(0);
    });
  });
});
