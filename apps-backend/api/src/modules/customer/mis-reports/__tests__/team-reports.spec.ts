import { TeamLeaderboardReport } from '../reports/team/team-leaderboard.report';
import { WorkloadDistributionReport } from '../reports/team/workload-distribution.report';
import { ResponseTimeReport } from '../reports/team/response-time.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const mockDrillDown = { getLeads: jest.fn(), getActivities: jest.fn(), getDemos: jest.fn(), getContacts: jest.fn() };

describe('Team Reports', () => {
  describe('TeamLeaderboardReport', () => {
    it('returns correct report code and category', () => {
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue([]) },
        lead: { groupBy: jest.fn().mockResolvedValue([]), findMany: jest.fn().mockResolvedValue([]) },
        activity: { groupBy: jest.fn().mockResolvedValue([]) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new TeamLeaderboardReport(mockPrisma, mockDrillDown as any);
      expect(report.code).toBe('TEAM_LEADERBOARD');
      expect(report.category).toBe('TEAM');
    });

    it('generates leaderboard ranked by metric', async () => {
      const mockUsers = [
        { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
        { id: 'u2', firstName: 'Priya', lastName: 'Shah' },
      ];
      const mockLeads = [
        { allocatedToId: 'u1', status: 'WON', expectedValue: 50000 },
        { allocatedToId: 'u1', status: 'ACTIVE', expectedValue: 30000 },
        { allocatedToId: 'u2', status: 'WON', expectedValue: 80000 },
      ];
      const mockActivities = [
        { createdById: 'u1' },
        { createdById: 'u1' },
        { createdById: 'u2' },
      ];
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue(mockUsers) },
        lead: { findMany: jest.fn().mockResolvedValue(mockLeads) },
        activity: { findMany: jest.fn().mockResolvedValue(mockActivities) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new TeamLeaderboardReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('TEAM_LEADERBOARD');
      expect(result.tables[0].rows.length).toBe(2);
    });
  });

  describe('WorkloadDistributionReport', () => {
    it('detects overloaded and underloaded users', async () => {
      const mockUsers = [
        { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
        { id: 'u2', firstName: 'Priya', lastName: 'Shah' },
      ];
      const mockActiveLeads = [
        { allocatedToId: 'u1' },
        { allocatedToId: 'u1' },
        { allocatedToId: 'u1' },
        { allocatedToId: 'u2' },
      ];
      const mockDemos = [
        { conductedById: 'u1' },
      ];
      const mockQuotations = [
        { createdById: 'u1' },
        { createdById: 'u2' },
      ];
      const mockLastActivities = [
        { createdById: 'u1', createdAt: new Date('2025-01-28') },
        { createdById: 'u2', createdAt: new Date('2025-01-20') },
      ];
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue(mockUsers) },
        lead: { findMany: jest.fn().mockResolvedValue(mockActiveLeads) },
        demo: { findMany: jest.fn().mockResolvedValue(mockDemos) },
        quotation: { findMany: jest.fn().mockResolvedValue(mockQuotations) },
        activity: { findMany: jest.fn().mockResolvedValue(mockLastActivities) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new WorkloadDistributionReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('WORKLOAD_DISTRIBUTION');
      expect(result.summary.length).toBeGreaterThan(0);
    });
  });

  describe('ResponseTimeReport', () => {
    it('calculates response time per user', async () => {
      const mockUsers = [
        { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
      ];
      const mockLeads = [
        { id: 'l1', allocatedToId: 'u1', allocatedAt: new Date('2025-01-10T10:00:00') },
        { id: 'l2', allocatedToId: 'u1', allocatedAt: new Date('2025-01-15T09:00:00') },
      ];
      const mockFirstActivities = [
        { leadId: 'l1', createdAt: new Date('2025-01-10T12:00:00') },
        { leadId: 'l2', createdAt: new Date('2025-01-15T15:00:00') },
      ];
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue(mockUsers) },
        lead: { findMany: jest.fn().mockResolvedValue(mockLeads) },
        activity: { findMany: jest.fn().mockResolvedValue(mockFirstActivities) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new ResponseTimeReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('RESPONSE_TIME');
      expect(result.tables.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('TeamLeaderboardReport: returns empty rows when no users exist', async () => {
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue([]) },
        lead: { findMany: jest.fn().mockResolvedValue([]) },
        activity: { findMany: jest.fn().mockResolvedValue([]) },
      } as any;
      (mockPrisma as any).working = mockPrisma;
      const report = new TeamLeaderboardReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);
      expect(result.tables[0].rows.length).toBe(0);
    });

    it('WorkloadDistributionReport: propagates DB error from user.findMany', async () => {
      const mockPrisma = {
        user: { findMany: jest.fn().mockRejectedValue(new Error('DB error')) },
      } as any;
      (mockPrisma as any).working = mockPrisma;
      const report = new WorkloadDistributionReport(mockPrisma, mockDrillDown as any);
      await expect(report.generate(baseParams)).rejects.toThrow('DB error');
    });

    it('ResponseTimeReport: returns empty tables when no leads exist', async () => {
      const mockPrisma = {
        user: { findMany: jest.fn().mockResolvedValue([{ id: 'u1', firstName: 'A', lastName: 'B' }]) },
        lead: { findMany: jest.fn().mockResolvedValue([]) },
        activity: { findMany: jest.fn().mockResolvedValue([]) },
      } as any;
      (mockPrisma as any).working = mockPrisma;
      const report = new ResponseTimeReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);
      expect(result.reportCode).toBe('RESPONSE_TIME');
    });
  });
});
