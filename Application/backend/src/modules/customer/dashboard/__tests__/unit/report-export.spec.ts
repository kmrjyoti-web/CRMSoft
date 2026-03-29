import { ReportExportService } from '../../services/report-export.service';

describe('Report Export Service', () => {
  let prisma: any;
  let service: ReportExportService;

  beforeEach(() => {
    prisma = {
      lead: {
        findMany: jest.fn().mockResolvedValue([
          {
            leadNumber: 'L-001', status: 'NEW', priority: 'HIGH', expectedValue: 50000,
            createdAt: new Date(), contact: { firstName: 'John', lastName: 'Doe' },
            organization: { name: 'Acme Corp' }, allocatedTo: { firstName: 'Alice', lastName: 'Smith' },
          },
        ]),
      },
      activity: {
        findMany: jest.fn().mockResolvedValue([
          {
            type: 'CALL', subject: 'Follow up call', outcome: 'Interested', createdAt: new Date(),
            lead: { leadNumber: 'L-001' }, createdByUser: { firstName: 'Alice', lastName: 'Smith' },
          },
        ]),
      },
      quotation: {
        findMany: jest.fn().mockResolvedValue([
          {
            quotationNo: 'Q-001', status: 'SENT', totalAmount: 50000, createdAt: new Date(),
            lead: { leadNumber: 'L-001' }, createdByUser: { firstName: 'Alice', lastName: 'Smith' },
          },
        ]),
      },
      reportExportLog: {
        create: jest.fn().mockResolvedValue({ id: 'exp-1' }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'exp-1', reportType: 'LEAD_REPORT', format: 'CSV', status: 'COMPLETED', createdAt: new Date() },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
(prisma as any).working = prisma;
    service = new ReportExportService(prisma);
  });

  it('should export CSV report for leads', async () => {
    const result = await service.exportReport({
      reportType: 'LEAD_REPORT', format: 'CSV',
      filters: { dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31') },
      exportedById: 'user-1', exportedByName: 'Alice Smith',
    });
    expect(result.recordCount).toBe(1);
    expect(result.fileUrl).toContain('LEAD_REPORT');
    expect(result.fileUrl).toContain('.csv');
    expect(result.fileSize).toBeGreaterThan(0);
    expect(prisma.reportExportLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }),
    );
  });

  it('should export XLSX report with styled workbook', async () => {
    const result = await service.exportReport({
      reportType: 'LEAD_REPORT', format: 'XLSX',
      filters: {}, exportedById: 'user-1', exportedByName: 'Alice Smith',
    });
    expect(result.recordCount).toBe(1);
    expect(result.fileUrl).toContain('.xlsx');
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it('should export JSON report', async () => {
    const result = await service.exportReport({
      reportType: 'LEAD_REPORT', format: 'JSON',
      filters: {}, exportedById: 'user-1', exportedByName: 'Alice Smith',
    });
    expect(result.recordCount).toBe(1);
    expect(result.fileUrl).toContain('.json');
  });

  it('should export activity report', async () => {
    const result = await service.exportReport({
      reportType: 'ACTIVITY_REPORT', format: 'CSV',
      filters: {}, exportedById: 'user-1', exportedByName: 'Alice Smith',
    });
    expect(result.recordCount).toBe(1);
    expect(result.fileUrl).toContain('ACTIVITY_REPORT');
  });

  it('should return export history with pagination', async () => {
    const result = await service.getExportHistory('user-1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});
