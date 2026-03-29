import { SalesSummaryReport } from '../reports/sales/sales-summary.report';
import { RevenueReport } from '../reports/sales/revenue.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

describe('SalesSummaryReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: SalesSummaryReport;

  beforeEach(() => {
    mockPrisma = {
      lead: {
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new SalesSummaryReport(mockPrisma, mockDrillDown);
  });

  it('generate returns correct KPIs', async () => {
    const now = new Date('2025-01-15');
    mockPrisma.lead.findMany.mockResolvedValue([
      { id: '1', status: 'NEW', expectedValue: 50000, createdAt: now, updatedAt: now },
      { id: '2', status: 'WON', expectedValue: 100000, createdAt: now, updatedAt: now },
      { id: '3', status: 'WON', expectedValue: 200000, createdAt: now, updatedAt: now },
      { id: '4', status: 'LOST', expectedValue: 30000, createdAt: now, updatedAt: now },
    ]);

    const result = await report.generate(baseParams);

    const totalLeads = result.summary.find(m => m.key === 'totalLeads');
    const wonLeads = result.summary.find(m => m.key === 'wonLeads');
    const wonRevenue = result.summary.find(m => m.key === 'wonRevenue');
    const conversionRate = result.summary.find(m => m.key === 'conversionRate');

    expect(totalLeads!.value).toBe(4);
    expect(wonLeads!.value).toBe(2);
    expect(wonRevenue!.value).toBe(300000);
    expect(conversionRate!.value).toBe(50);
  });

  it('generate returns charts with LINE and PIE types', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([
      { id: '1', status: 'NEW', expectedValue: 10000, createdAt: new Date('2025-01-10'), updatedAt: new Date('2025-01-10') },
      { id: '2', status: 'WON', expectedValue: 50000, createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-01-25') },
    ]);

    const result = await report.generate(baseParams);

    expect(result.charts).toHaveLength(2);
    expect(result.charts[0].type).toBe('LINE');
    expect(result.charts[1].type).toBe('PIE');
  });

  it('drillDown by status calls drillDownSvc.getLeads with status filter', async () => {
    mockDrillDown.getLeads.mockResolvedValue({
      dimension: '', value: '', columns: [], rows: [], total: 0, page: 1, limit: 10,
    });

    await report.drillDown({
      reportCode: 'SALES_SUMMARY',
      dimension: 'status',
      value: 'WON',
      dateFrom: baseParams.dateFrom,
      dateTo: baseParams.dateTo,
      filters: { tenantId: 'tenant-1' },
      page: 1,
      limit: 10,
    });

    expect(mockDrillDown.getLeads).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'WON' }),
      1,
      10,
    );
  });
});

describe('RevenueReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: RevenueReport;

  beforeEach(() => {
    mockPrisma = {
      lead: {
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getLeads: jest.fn() } as any;
    report = new RevenueReport(mockPrisma, mockDrillDown);
  });

  it('generate calculates totalRevenue correctly from WON leads', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([
      { expectedValue: 100000, updatedAt: new Date('2025-01-10'), leadNumber: 'L001', contact: null, organization: null, filters: [] },
      { expectedValue: 250000, updatedAt: new Date('2025-01-20'), leadNumber: 'L002', contact: null, organization: null, filters: [] },
      { expectedValue: 150000, updatedAt: new Date('2025-01-25'), leadNumber: 'L003', contact: null, organization: null, filters: [] },
    ]);

    const result = await report.generate(baseParams);

    const totalRevenue = result.summary.find(m => m.key === 'totalRevenue');
    expect(totalRevenue!.value).toBe(500000);
    expect(result.summary.find(m => m.key === 'dealCount')!.value).toBe(3);
    expect(result.summary.find(m => m.key === 'avgDealSize')!.value).toBe(Math.round(500000 / 3));
  });

  it('generate produces correct deal size distribution in PIE chart', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([
      { expectedValue: 10000, updatedAt: new Date('2025-01-05'), leadNumber: 'L1', contact: null, organization: null, filters: [] },
      { expectedValue: 80000, updatedAt: new Date('2025-01-10'), leadNumber: 'L2', contact: null, organization: null, filters: [] },
      { expectedValue: 200000, updatedAt: new Date('2025-01-15'), leadNumber: 'L3', contact: null, organization: null, filters: [] },
      { expectedValue: 600000, updatedAt: new Date('2025-01-20'), leadNumber: 'L4', contact: null, organization: null, filters: [] },
    ]);

    const result = await report.generate(baseParams);

    const pieChart = result.charts.find(c => c.type === 'PIE');
    expect(pieChart).toBeDefined();
    expect(pieChart!.labels).toEqual(['0-50K', '50K-1L', '1L-5L', '5L+']);
    // 10K -> 0-50K, 80K -> 50K-1L, 200K -> 1L-5L, 600K -> 5L+
    expect(pieChart!.datasets[0].data).toEqual([1, 1, 1, 1]);
  });
});
