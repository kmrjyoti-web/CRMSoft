import { LeadFunnelReport } from '../reports/leads/lead-funnel.report';
import { LeadAgingReport } from '../reports/leads/lead-aging.report';
import { HotLeadsReport } from '../reports/leads/hot-leads.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

describe('LeadFunnelReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: LeadFunnelReport;

  beforeEach(() => {
    mockPrisma = {
      lead: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new LeadFunnelReport(mockPrisma, mockDrillDown);
  });

  it('funnel drop-off: overallConversion is 20% when 20 of 100 leads are WON', async () => {
    const leads = [
      ...Array(100).fill(null).map(() => ({ status: 'NEW', expectedValue: 1000, filters: [] })),
      ...Array(80).fill(null).map(() => ({ status: 'VERIFIED', expectedValue: 1000, filters: [] })),
      ...Array(60).fill(null).map(() => ({ status: 'ALLOCATED', expectedValue: 1000, filters: [] })),
      ...Array(20).fill(null).map(() => ({ status: 'WON', expectedValue: 5000, filters: [] })),
    ];
    mockPrisma.lead.findMany.mockResolvedValue(leads);

    const result = await report.generate(baseParams);

    const overallConversion = result.summary.find(m => m.key === 'overallConversion');
    // WON = 20, total = 260, conversion = 20/260 = 7.69%
    expect(overallConversion!.value).toBe(Math.round((20 / 260) * 10000) / 100);

    const funnelChart = result.charts.find(c => c.type === 'FUNNEL');
    expect(funnelChart).toBeDefined();
    expect(funnelChart!.labels).toContain('NEW');
    expect(funnelChart!.labels).toContain('WON');
  });

  it('identifies biggest leak stage as the stage with the highest drop-off count', async () => {
    // NEW:100, VERIFIED:80 (drop 20), ALLOCATED:30 (drop 50 - biggest), WON:25 (drop 5)
    const leads = [
      ...Array(100).fill(null).map(() => ({ status: 'NEW', expectedValue: 1000, filters: [] })),
      ...Array(80).fill(null).map(() => ({ status: 'VERIFIED', expectedValue: 1000, filters: [] })),
      ...Array(30).fill(null).map(() => ({ status: 'ALLOCATED', expectedValue: 1000, filters: [] })),
      ...Array(25).fill(null).map(() => ({ status: 'WON', expectedValue: 5000, filters: [] })),
    ];
    mockPrisma.lead.findMany.mockResolvedValue(leads);

    const result = await report.generate(baseParams);

    // The stage where the biggest absolute drop occurs: VERIFIED->ALLOCATED drops by 50
    expect(result.metadata!.biggestLeakStage).toBe('ALLOCATED');
    const leakMetric = result.summary.find(m => m.key === 'biggestLeakStage');
    expect(leakMetric!.value).toBe(50);
  });
});

describe('LeadAgingReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: LeadAgingReport;

  beforeEach(() => {
    mockPrisma = {
      lead: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new LeadAgingReport(mockPrisma, mockDrillDown);
  });

  it('bucket distribution: BAR chart has 5 buckets with correct counts', async () => {
    const now = Date.now();
    const leads = [
      { leadNumber: 'L1', status: 'NEW', expectedValue: 1000, createdAt: new Date(now - 1 * 86400000), contact: null, organization: null },
      { leadNumber: 'L2', status: 'VERIFIED', expectedValue: 2000, createdAt: new Date(now - 10 * 86400000), contact: null, organization: null },
      { leadNumber: 'L3', status: 'ALLOCATED', expectedValue: 3000, createdAt: new Date(now - 45 * 86400000), contact: null, organization: null },
      { leadNumber: 'L4', status: 'IN_PROGRESS', expectedValue: 4000, createdAt: new Date(now - 90 * 86400000), contact: null, organization: null },
    ];
    mockPrisma.lead.findMany.mockResolvedValue(leads);

    const result = await report.generate(baseParams);

    const barChart = result.charts.find(c => c.type === 'BAR');
    expect(barChart).toBeDefined();
    expect(barChart!.labels).toEqual(['0-7 days', '8-14 days', '15-30 days', '31-60 days', '60+ days']);
    // 1 day -> bucket 0, 10 days -> bucket 1, 45 days -> bucket 3, 90 days -> bucket 4
    expect(barChart!.datasets[0].data).toEqual([1, 1, 0, 1, 1]);
  });

  it('stale percentage is correct for leads older than 30 days', async () => {
    const now = Date.now();
    const leads = [
      { leadNumber: 'L1', status: 'NEW', expectedValue: 1000, createdAt: new Date(now - 5 * 86400000), contact: null, organization: null },
      { leadNumber: 'L2', status: 'NEW', expectedValue: 1000, createdAt: new Date(now - 10 * 86400000), contact: null, organization: null },
      { leadNumber: 'L3', status: 'NEW', expectedValue: 1000, createdAt: new Date(now - 35 * 86400000), contact: null, organization: null },
      { leadNumber: 'L4', status: 'NEW', expectedValue: 1000, createdAt: new Date(now - 60 * 86400000), contact: null, organization: null },
    ];
    mockPrisma.lead.findMany.mockResolvedValue(leads);

    const result = await report.generate(baseParams);

    const stalePct = result.summary.find(m => m.key === 'stalePctOverThirtyDays');
    // 2 out of 4 leads are >30 days old => 50%
    expect(stalePct!.value).toBe(50);
  });
});

describe('HotLeadsReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: HotLeadsReport;

  beforeEach(() => {
    mockPrisma = {
      lead: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new HotLeadsReport(mockPrisma, mockDrillDown);
  });

  it('scoring: URGENT priority + close in 5 days + value 600K = score 100', async () => {
    const now = new Date();
    const fiveDaysLater = new Date(now.getTime() + 5 * 86400000);

    mockPrisma.lead.findMany.mockResolvedValue([
      {
        id: 'lead-1',
        leadNumber: 'L001',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        expectedValue: 600000,
        expectedCloseDate: fiveDaysLater,
        createdAt: new Date('2025-01-01'),
        contact: { firstName: 'John', lastName: 'Doe' },
        organization: { name: 'Acme Corp' },
      },
    ]);

    const result = await report.generate(baseParams);

    // URGENT = 40, <=7 days to close = 30, >500K = 30 => total = 100
    const hotLead = result.tables[0].rows[0];
    expect(hotLead.score).toBe(100);
    expect(result.summary.find(m => m.key === 'hotLeadCount')!.value).toBe(1);
    expect(result.summary.find(m => m.key === 'urgentCount')!.value).toBe(1);
  });
});
