import { OrgWiseRevenueReport } from '../reports/contacts/org-wise-revenue.report';
import { IndustryWiseAnalysisReport } from '../reports/contacts/industry-wise-analysis.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

describe('OrgWiseRevenueReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: OrgWiseRevenueReport;

  beforeEach(() => {
    mockPrisma = {
      organization: { findMany: jest.fn() },
      lead: { findMany: jest.fn() },
    } as any;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new OrgWiseRevenueReport(mockPrisma, mockDrillDown);
  });

  it('org lifetime value: top org has correct revenue and BAR chart exists', async () => {
    mockPrisma.organization.findMany.mockResolvedValue([
      { id: 'org-1', name: 'Alpha Corp' },
      { id: 'org-2', name: 'Beta Inc' },
    ]);

    // Period leads for Alpha Corp (org-1): 2 WON
    // Period leads for Beta Inc (org-2): 1 WON
    mockPrisma.lead.findMany
      // Alpha period leads
      .mockResolvedValueOnce([
        { status: 'WON', expectedValue: 200000 },
        { status: 'WON', expectedValue: 300000 },
        { status: 'NEW', expectedValue: 50000 },
      ])
      // Alpha lifetime WON leads
      .mockResolvedValueOnce([
        { expectedValue: 200000 },
        { expectedValue: 300000 },
        { expectedValue: 100000 },
      ])
      // Beta period leads
      .mockResolvedValueOnce([
        { status: 'WON', expectedValue: 100000 },
      ])
      // Beta lifetime WON leads
      .mockResolvedValueOnce([
        { expectedValue: 100000 },
      ]);

    const result = await report.generate(baseParams);

    // Alpha has revenue 500000, Beta has 100000
    expect(result.summary.find(m => m.key === 'topOrgRevenue')!.value).toBe(500000);

    const barChart = result.charts.find(c => c.type === 'BAR');
    expect(barChart).toBeDefined();
    expect(barChart!.labels[0]).toBe('Alpha Corp');

    // Verify table rows are sorted by revenue descending
    expect(result.tables[0].rows[0].orgName).toBe('Alpha Corp');
    expect(result.tables[0].rows[0].revenue).toBe(500000);
    expect(result.tables[0].rows[0].lifetime).toBe(600000);
  });

  it('pareto calculation: 2 of 10 orgs producing 80% of revenue yields ~20%', async () => {
    // Create 10 orgs
    const orgs = Array.from({ length: 10 }, (_, i) => ({
      id: `org-${i}`, name: `Org ${i}`,
    }));
    mockPrisma.organization.findMany.mockResolvedValue(orgs);

    // 2 orgs produce 80% of revenue, remaining 8 produce 20%
    // Total revenue = 1_000_000, top 2 orgs = 400_000 each = 800_000
    const mockCalls: any[] = [];
    for (let i = 0; i < 10; i++) {
      const revenue = i < 2 ? 400000 : 25000; // 2 * 400K + 8 * 25K = 1_000_000
      // Period leads call
      mockCalls.push([{ status: 'WON', expectedValue: revenue }]);
      // Lifetime WON leads call
      mockCalls.push([{ expectedValue: revenue }]);
    }
    for (const mockData of mockCalls) {
      mockPrisma.lead.findMany.mockResolvedValueOnce(mockData);
    }

    const result = await report.generate(baseParams);

    const paretoPercent = result.summary.find(m => m.key === 'paretoPercent');
    expect(paretoPercent).toBeDefined();
    expect(paretoPercent!.value).toBe(20);
  });
});

describe('IndustryWiseAnalysisReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: IndustryWiseAnalysisReport;

  beforeEach(() => {
    mockPrisma = {
      lead: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    } as any;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new IndustryWiseAnalysisReport(mockPrisma, mockDrillDown);
  });

  it('industry grouping: table rows have correct industry groups', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([
      { status: 'WON', expectedValue: 100000, organization: { industry: 'IT' } },
      { status: 'WON', expectedValue: 200000, organization: { industry: 'IT' } },
      { status: 'NEW', expectedValue: 50000, organization: { industry: 'Healthcare' } },
      { status: 'WON', expectedValue: 80000, organization: { industry: 'Healthcare' } },
      { status: 'LOST', expectedValue: 30000, organization: { industry: 'Healthcare' } },
      { status: 'NEW', expectedValue: 40000, organization: { industry: 'Finance' } },
    ]);

    const result = await report.generate(baseParams);

    const rows = result.tables[0].rows;
    expect(rows).toHaveLength(3);

    // Sorted by revenue descending: IT(300K) > Healthcare(80K) > Finance(0)
    const itRow = rows.find((r: any) => r.industry === 'IT');
    const healthRow = rows.find((r: any) => r.industry === 'Healthcare');
    const financeRow = rows.find((r: any) => r.industry === 'Finance');

    expect(itRow.leads).toBe(2);
    expect(itRow.won).toBe(2);
    expect(itRow.revenue).toBe(300000);

    expect(healthRow.leads).toBe(3);
    expect(healthRow.won).toBe(1);
    expect(healthRow.lost).toBe(1);
    expect(healthRow.revenue).toBe(80000);

    expect(financeRow.leads).toBe(1);
    expect(financeRow.revenue).toBe(0);

    expect(result.summary.find(m => m.key === 'totalIndustries')!.value).toBe(3);
  });
});
