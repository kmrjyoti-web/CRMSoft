import { EmailPerformanceReport } from '../reports/communications/email-performance.report';
import { ChannelEffectivenessReport } from '../reports/communications/channel-effectiveness.report';
import { CampaignReport } from '../reports/communications/campaign-report.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const mockDrillDown = { getLeads: jest.fn(), getActivities: jest.fn(), getDemos: jest.fn(), getContacts: jest.fn() };

describe('Communication Reports', () => {
  describe('EmailPerformanceReport', () => {
    it('returns correct report code and category', () => {
      const mockPrisma = {
        activity: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        quotationSendLog: { findMany: jest.fn().mockResolvedValue([]) },
        lead: { count: jest.fn().mockResolvedValue(0) },
      } as any;
      const report = new EmailPerformanceReport(mockPrisma, mockDrillDown as any);
      expect(report.code).toBe('EMAIL_PERFORMANCE');
      expect(report.category).toBe('COMMUNICATION');
    });

    it('generates email metrics with volume and user breakdown', async () => {
      const mockActivities = [
        { id: 'a1', createdAt: new Date('2025-01-10'), leadId: 'l1', createdByUser: { id: 'u1', firstName: 'Raj', lastName: 'Patel' } },
        { id: 'a2', createdAt: new Date('2025-01-11'), leadId: 'l2', createdByUser: { id: 'u1', firstName: 'Raj', lastName: 'Patel' } },
        { id: 'a3', createdAt: new Date('2025-01-12'), leadId: 'l1', createdByUser: { id: 'u2', firstName: 'Priya', lastName: 'Shah' } },
      ];
      const mockPrisma = {
        activity: { findMany: jest.fn().mockResolvedValue(mockActivities), count: jest.fn().mockResolvedValue(3) },
        quotationSendLog: { findMany: jest.fn().mockResolvedValue([]) },
        lead: { count: jest.fn().mockResolvedValue(10) },
      } as any;
      const report = new EmailPerformanceReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('EMAIL_PERFORMANCE');
      expect(result.summary.find(m => m.key === 'totalEmailActivities')?.value).toBe(3);
    });
  });

  describe('ChannelEffectivenessReport', () => {
    it('compares channels by activity volume and conversion', async () => {
      const mockActivities = [
        { type: 'EMAIL', leadId: 'l1' },
        { type: 'EMAIL', leadId: 'l2' },
        { type: 'CALL', leadId: 'l1' },
        { type: 'WHATSAPP', leadId: 'l3' },
      ];
      const mockLeads = [
        { id: 'l1', status: 'WON', expectedValue: 50000 },
        { id: 'l2', status: 'ACTIVE', expectedValue: 30000 },
        { id: 'l3', status: 'WON', expectedValue: 20000 },
      ];
      const mockPrisma = {
        activity: { findMany: jest.fn().mockResolvedValue(mockActivities) },
        lead: { findMany: jest.fn().mockResolvedValue(mockLeads) },
      } as any;
      const report = new ChannelEffectivenessReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('CHANNEL_EFFECTIVENESS');
      expect(result.tables.length).toBeGreaterThan(0);
    });
  });

  describe('CampaignReport', () => {
    it('groups quotation sends as campaigns', async () => {
      const mockSendLogs = [
        { id: 's1', channel: 'EMAIL', sentAt: new Date('2025-01-10'), sentById: 'u1', sentBy: { firstName: 'Raj', lastName: 'Patel' }, quotation: { totalAmount: 50000, status: 'ACCEPTED' }, viewedAt: new Date() },
        { id: 's2', channel: 'EMAIL', sentAt: new Date('2025-01-10'), sentById: 'u1', sentBy: { firstName: 'Raj', lastName: 'Patel' }, quotation: { totalAmount: 30000, status: 'PENDING' }, viewedAt: null },
        { id: 's3', channel: 'WHATSAPP', sentAt: new Date('2025-01-15'), sentById: 'u2', sentBy: { firstName: 'Priya', lastName: 'Shah' }, quotation: { totalAmount: 20000, status: 'REJECTED' }, viewedAt: null },
      ];
      const mockPrisma = {
        quotationSendLog: { findMany: jest.fn().mockResolvedValue(mockSendLogs) },
      } as any;
      const report = new CampaignReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('CAMPAIGN_REPORT');
      expect(result.summary.find(m => m.key === 'totalQuotationsSent')?.value).toBe(3);
    });
  });
});
