import { CeoDashboardReport } from '../reports/executive/ceo-dashboard.report';
import { PipelineHealthReport } from '../reports/executive/pipeline-health.report';
import { CustomerConcentrationReport } from '../reports/executive/customer-concentration.report';
import { CustomReportReport } from '../reports/executive/custom-report.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const mockDrillDown = { getLeads: jest.fn(), getActivities: jest.fn(), getDemos: jest.fn(), getContacts: jest.fn() };

describe('Executive Reports', () => {
  describe('CeoDashboardReport', () => {
    it('returns correct report code and category', () => {
      const mockPrisma = {
        lead: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
        activity: { count: jest.fn().mockResolvedValue(0) },
        demo: { count: jest.fn().mockResolvedValue(0) },
        quotation: { count: jest.fn().mockResolvedValue(0) },
        salesTarget: { findMany: jest.fn().mockResolvedValue([]) },
        user: { count: jest.fn().mockResolvedValue(0) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new CeoDashboardReport(mockPrisma, mockDrillDown as any);
      expect(report.code).toBe('CEO_DASHBOARD');
      expect(report.category).toBe('EXECUTIVE');
    });
  });

  describe('PipelineHealthReport', () => {
    it('calculates health score from pipeline data', async () => {
      const now = new Date();
      const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
      const mockLeads = [
        {
          id: 'l1', leadNumber: 'LD-001', status: 'NEW', expectedValue: 50000,
          createdAt: daysAgo(5), updatedAt: daysAgo(2),
          expectedCloseDate: new Date(now.getTime() + 86400000 * 10),
          contact: { firstName: 'John', lastName: 'Doe' },
          organization: { name: 'Corp A' },
          allocatedTo: { firstName: 'Raj', lastName: 'Patel' },
        },
        {
          id: 'l2', leadNumber: 'LD-002', status: 'CONTACTED', expectedValue: 30000,
          createdAt: daysAgo(20), updatedAt: daysAgo(18),
          expectedCloseDate: daysAgo(5),
          contact: { firstName: 'Jane', lastName: 'Smith' },
          organization: { name: 'Corp B' },
          allocatedTo: { firstName: 'Priya', lastName: 'Shah' },
        },
        {
          id: 'l3', leadNumber: 'LD-003', status: 'QUALIFIED', expectedValue: 80000,
          createdAt: daysAgo(40), updatedAt: daysAgo(35),
          expectedCloseDate: new Date(now.getTime() + 86400000 * 5),
          contact: { firstName: 'Bob', lastName: 'Brown' },
          organization: { name: 'Corp C' },
          allocatedTo: { firstName: 'Raj', lastName: 'Patel' },
        },
      ];
      const mockActivities = [
        { leadId: 'l1', createdAt: daysAgo(1) },
        { leadId: 'l3', createdAt: daysAgo(2) },
      ];
      const mockPrisma = {
        lead: { findMany: jest.fn().mockResolvedValue(mockLeads) },
        activity: { findMany: jest.fn().mockResolvedValue(mockActivities) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new PipelineHealthReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('PIPELINE_HEALTH');
      expect(result.summary.find(m => m.key === 'healthScore')).toBeDefined();
      expect(result.metadata?.healthScore).toBeDefined();
    });
  });

  describe('CustomerConcentrationReport', () => {
    it('generates Pareto analysis of revenue by org', async () => {
      const mockLeads = [
        { id: 'l1', expectedValue: 100000, organization: { id: 'org1', name: 'Corp A', industry: 'Technology' } },
        { id: 'l2', expectedValue: 50000, organization: { id: 'org1', name: 'Corp A', industry: 'Technology' } },
        { id: 'l3', expectedValue: 80000, organization: { id: 'org2', name: 'Corp B', industry: 'Finance' } },
        { id: 'l4', expectedValue: 20000, organization: { id: 'org3', name: 'Corp C', industry: 'Healthcare' } },
      ];
      const mockPrisma = {
        lead: { findMany: jest.fn().mockResolvedValue(mockLeads) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new CustomerConcentrationReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('CUSTOMER_CONCENTRATION');
      expect(result.tables[0].rows.length).toBe(3); // 3 organizations
    });
  });

  describe('CustomReportReport', () => {
    it('returns correct report code and supports dynamic queries', () => {
      const mockPrisma = {} as any;
(mockPrisma as any).working = mockPrisma;
      const report = new CustomReportReport(mockPrisma, mockDrillDown as any);
      expect(report.code).toBe('CUSTOM_REPORT');
      expect(report.category).toBe('CUSTOM');
      expect(report.supportsDrillDown).toBe(false);
    });

    it('handles unknown entity gracefully', async () => {
      const mockPrisma = {} as any;
(mockPrisma as any).working = mockPrisma;
      const report = new CustomReportReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate({
        ...baseParams,
        filters: { entity: 'UNKNOWN_ENTITY' },
      });
      expect(result.metadata?.error).toContain('Unknown entity');
    });
  });
});
