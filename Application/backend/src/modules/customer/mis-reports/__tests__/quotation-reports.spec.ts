import { QuotationSummaryReport } from '../reports/quotations/quotation-summary.report';
import { QuotationAgingReport } from '../reports/quotations/quotation-aging.report';
import { ProductWiseQuotationReport } from '../reports/quotations/product-wise-quotation.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const mockDrillDown = { getLeads: jest.fn(), getActivities: jest.fn(), getDemos: jest.fn(), getContacts: jest.fn() };

describe('Quotation Reports', () => {
  describe('QuotationSummaryReport', () => {
    it('returns correct report code and category', () => {
      const mockPrisma = {
        quotation: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const resolver = { resolveUsers: jest.fn().mockImplementation((r: any) => Promise.resolve(r)) } as any;
      const report = new QuotationSummaryReport(mockPrisma, mockDrillDown as any, resolver);
      expect(report.code).toBe('QUOTATION_SUMMARY');
      expect(report.category).toBe('QUOTATION');
      expect(report.supportsDrillDown).toBe(true);
    });

    it('generates summary with quotation KPIs', async () => {
      const mockQuotations = [
        {
          id: '1', status: 'ACCEPTED', totalAmount: 50000, createdAt: new Date('2025-01-10'),
          createdById: 'u1', acceptedAt: new Date('2025-01-15'),
          sendLogs: [{ sentAt: new Date('2025-01-11') }],
          createdBy: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
        },
        {
          id: '2', status: 'SENT', totalAmount: 30000, createdAt: new Date('2025-01-15'),
          createdById: 'u1',
          sendLogs: [{ sentAt: new Date('2025-01-16') }],
          createdBy: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
        },
        {
          id: '3', status: 'REJECTED', totalAmount: 20000, createdAt: new Date('2025-01-20'),
          createdById: 'u2', rejectedAt: new Date('2025-01-25'),
          sendLogs: [{ sentAt: new Date('2025-01-21') }],
          createdBy: { id: 'u2', firstName: 'Priya', lastName: 'Shah' },
        },
      ];
      const mockPrisma = {
        quotation: { findMany: jest.fn().mockResolvedValue(mockQuotations), count: jest.fn().mockResolvedValue(3) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const resolver = { resolveUsers: jest.fn().mockImplementation((r: any) => Promise.resolve(r)) } as any;
      const report = new QuotationSummaryReport(mockPrisma, mockDrillDown as any, resolver);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('QUOTATION_SUMMARY');
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.summary.find(m => m.key === 'totalQuotations')?.value).toBe(3);
      expect(result.tables.length).toBeGreaterThan(0);
    });
  });

  describe('QuotationAgingReport', () => {
    it('groups quotations into aging buckets', async () => {
      const now = new Date();
      const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
      const mockQuotations = [
        {
          id: '1', quotationNo: 'Q-001', status: 'SENT', totalAmount: 10000, createdAt: daysAgo(3),
          validUntil: new Date(now.getTime() + 86400000 * 10),
          lead: {
            organization: { name: 'Corp A' },
            contact: { firstName: 'John', lastName: 'Doe' },
            allocatedTo: { firstName: 'A', lastName: 'B' },
          },
        },
        {
          id: '2', quotationNo: 'Q-002', status: 'SENT', totalAmount: 20000, createdAt: daysAgo(10),
          validUntil: new Date(now.getTime() + 86400000 * 5),
          lead: {
            organization: { name: 'Corp B' },
            contact: { firstName: 'Jane', lastName: 'Smith' },
            allocatedTo: { firstName: 'C', lastName: 'D' },
          },
        },
        {
          id: '3', quotationNo: 'Q-003', status: 'SENT', totalAmount: 50000, createdAt: daysAgo(35),
          validUntil: daysAgo(5),
          lead: {
            organization: { name: 'Corp C' },
            contact: { firstName: 'Bob', lastName: 'Brown' },
            allocatedTo: { firstName: 'E', lastName: 'F' },
          },
        },
      ];
      const mockPrisma = {
        quotation: { findMany: jest.fn().mockResolvedValue(mockQuotations) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new QuotationAgingReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('QUOTATION_AGING');
      expect(result.tables.length).toBeGreaterThanOrEqual(1);
      // Should have pending quotations table
      const pendingTable = result.tables.find(t => t.title.includes('Pending'));
      expect(pendingTable).toBeDefined();
    });
  });

  describe('ProductWiseQuotationReport', () => {
    it('breaks down quotations by product', async () => {
      const mockLineItems = [
        { id: 'li1', productName: 'CRM Basic', quantity: 2, unitPrice: 10000, lineTotal: 20000, quotation: { status: 'ACCEPTED' } },
        { id: 'li2', productName: 'ERP Suite', quantity: 1, unitPrice: 30000, lineTotal: 30000, quotation: { status: 'ACCEPTED' } },
        { id: 'li3', productName: 'CRM Basic', quantity: 1, unitPrice: 10000, lineTotal: 10000, quotation: { status: 'SENT' } },
      ];
      const mockPrisma = {
        quotationLineItem: { findMany: jest.fn().mockResolvedValue(mockLineItems) },
      } as any;
(mockPrisma as any).working = mockPrisma;
      const report = new ProductWiseQuotationReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('PRODUCT_WISE_QUOTATION');
      expect(result.tables.length).toBeGreaterThan(0);
      const productTable = result.tables[0];
      expect(productTable.rows.length).toBe(2); // 2 unique products
    });
  });
});
