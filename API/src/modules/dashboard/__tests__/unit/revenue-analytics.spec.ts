import { RevenueAnalyticsService } from '../../services/revenue-analytics.service';

describe('Revenue Analytics', () => {
  let prisma: any;
  let service: RevenueAnalyticsService;

  beforeEach(() => {
    prisma = {
      lead: {
        findMany: jest.fn().mockResolvedValue([
          {
            leadNumber: 'L-001', expectedValue: 50000, updatedAt: new Date('2025-01-20'),
            createdAt: new Date('2025-01-01'), status: 'WON', lostReason: null,
            organization: { name: 'Acme Corp' }, contact: { firstName: 'John', lastName: 'Doe', rawContacts: [{ source: 'WEBSITE' }] },
          },
          {
            leadNumber: 'L-002', expectedValue: 30000, updatedAt: new Date('2025-01-25'),
            createdAt: new Date('2025-01-05'), status: 'WON', lostReason: null,
            organization: { name: 'Beta Inc' }, contact: { firstName: 'Jane', lastName: 'Doe', rawContacts: [{ source: 'REFERRAL' }] },
          },
        ]),
        groupBy: jest.fn().mockResolvedValue([
          { status: 'IN_PROGRESS', _sum: { expectedValue: 100000 }, _count: 10 },
          { status: 'NEGOTIATION', _sum: { expectedValue: 50000 }, _count: 5 },
        ]),
        count: jest.fn().mockResolvedValue(20),
        aggregate: jest.fn().mockResolvedValue({ _sum: { expectedValue: 80000 } }),
      },
    };
    service = new RevenueAnalyticsService(prisma);
  });

  it('should return revenue analytics with won total and forecast', async () => {
    const result = await service.getRevenueAnalytics({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.won.total).toBe(80000);
    expect(result.won.count).toBe(2);
    expect(result.won.avgDealSize).toBe(40000);
    expect(result.pipeline).toBeDefined();
    expect(result.forecast.nextMonth).toHaveProperty('projected');
    expect(result.forecast.nextMonth).toHaveProperty('optimistic');
    expect(result.forecast.nextMonth).toHaveProperty('pessimistic');
  });

  it('should compute deal size distribution', async () => {
    const result = await service.getRevenueAnalytics({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.dealSizeDistribution).toHaveLength(4);
    const range50k = result.dealSizeDistribution.find(d => d.range === '₹0 - ₹50K');
    expect(range50k).toBeDefined();
    expect(range50k!.count).toBe(1); // 30000 falls in 0-50K
  });

  it('should analyze leads by source via rawContacts', async () => {
    const result = await service.getLeadSourceAnalysis({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('source');
    expect(result[0]).toHaveProperty('totalLeads');
    expect(result[0]).toHaveProperty('conversionRate');
    expect(result[0]).toHaveProperty('revenue');
  });

  it('should analyze lost reasons', async () => {
    prisma.lead.findMany.mockResolvedValue([
      { lostReason: 'Price too high', expectedValue: 50000, updatedAt: new Date() },
      { lostReason: 'Price too high', expectedValue: 30000, updatedAt: new Date() },
      { lostReason: 'Competitor', expectedValue: 40000, updatedAt: new Date() },
    ]);
    const result = await service.getLostReasonAnalysis({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.total).toBe(3);
    expect(result.totalLostValue).toBe(120000);
    expect(result.reasons[0].reason).toBe('Price too high');
    expect(result.reasons[0].count).toBe(2);
  });

  it('should compute velocity metrics', async () => {
    const result = await service.getVelocityMetrics({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result).toHaveProperty('salesVelocity');
    expect(result.components).toHaveProperty('numberOfDeals');
    expect(result.components).toHaveProperty('avgDealSize');
    expect(result.components).toHaveProperty('conversionRate');
    expect(result.components).toHaveProperty('avgSalesCycleDays');
  });
});
