import { DashboardAggregatorService } from '../../services/dashboard-aggregator.service';

describe('Executive Dashboard', () => {
  let prisma: any;
  let service: DashboardAggregatorService;

  beforeEach(() => {
    prisma = {
      lead: {
        count: jest.fn().mockResolvedValue(10),
        aggregate: jest.fn().mockResolvedValue({ _sum: { expectedValue: 50000 } }),
        findMany: jest.fn().mockResolvedValue([
          { createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-15') },
        ]),
        groupBy: jest.fn().mockResolvedValue([
          { status: 'NEW', _count: 5 },
          { status: 'WON', _count: 3 },
        ]),
      },
      activity: {
        count: jest.fn().mockResolvedValue(25),
        findMany: jest.fn().mockResolvedValue([
          { type: 'CALL', subject: 'Test', completedAt: new Date(), createdAt: new Date() },
        ]),
      },
      quotation: { count: jest.fn().mockResolvedValue(5) },
      followUp: { count: jest.fn().mockResolvedValue(2) },
      demo: { count: jest.fn().mockResolvedValue(3) },
      salesTarget: {
        findMany: jest.fn().mockResolvedValue([
          { metric: 'REVENUE', targetValue: 100000, currentValue: 50000, achievedPercent: 50 },
        ]),
      },
    };
(prisma as any).working = prisma;
    service = new DashboardAggregatorService(prisma);
  });

  it('should return 8 KPI cards with period comparison', async () => {
    const result = await service.getExecutiveDashboard({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.kpiCards).toHaveLength(8);
    expect(result.kpiCards[0]).toHaveProperty('key');
    expect(result.kpiCards[0]).toHaveProperty('value');
    expect(result.kpiCards[0]).toHaveProperty('changePercent');
    expect(result.kpiCards[0]).toHaveProperty('changeDirection');
  });

  it('should calculate correct conversion rate', async () => {
    prisma.lead.count
      .mockResolvedValueOnce(50)   // totalLeads
      .mockResolvedValueOnce(10)   // leadsWon
      .mockResolvedValueOnce(5)    // leadsLost
      .mockResolvedValueOnce(20)   // prevLeads
      .mockResolvedValueOnce(4)    // prevWon
      .mockResolvedValueOnce(2);   // prevLost
    const result = await service.getExecutiveDashboard({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    const convCard = result.kpiCards.find(c => c.key === 'conversion_rate');
    expect(convCard).toBeDefined();
    expect((convCard as any).suffix).toBe('%');
  });

  it('should include quick stats (overdue, upcoming demos, etc.)', async () => {
    const result = await service.getExecutiveDashboard({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.quickStats).toHaveProperty('overdueFollowUps');
    expect(result.quickStats).toHaveProperty('upcomingDemos');
    expect(result.quickStats).toHaveProperty('expiringQuotations');
    expect(result.quickStats).toHaveProperty('unassignedLeads');
  });

  it('should return my dashboard with today stats', async () => {
    const result = await service.getMyDashboard('user-1');
    expect(result.today).toHaveProperty('activitiesPlanned');
    expect(result.today).toHaveProperty('upcomingDemos');
    expect(result.today).toHaveProperty('overdueFollowUps');
    expect(result).toHaveProperty('myLeads');
    expect(result).toHaveProperty('myQuotations');
    expect(result).toHaveProperty('myTargets');
  });

  it('should compute target status in my dashboard', async () => {
    const result = await service.getMyDashboard('user-1');
    expect(result.myTargets).toHaveLength(1);
    expect(result.myTargets[0].status).toBe('AT_RISK');
    expect(result.myTargets[0].percent).toBe(50);
  });
});
