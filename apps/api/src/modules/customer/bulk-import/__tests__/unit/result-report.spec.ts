import { ResultReportService } from '../../services/result-report.service';

describe('ResultReportService', () => {
  let service: ResultReportService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      importJob: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'j1', fileName: 'test.csv', totalRows: 250,
          importedCount: 180, updatedCount: 12, skippedRows: 53, failedCount: 5,
          duplicateExactRows: 20, duplicateFuzzyRows: 8, duplicateInFileRows: 3,
          resultReportUrl: '/reports/import-report-j1.xlsx',
          failedRowsReportUrl: '/reports/import-failed-j1.xlsx',
        }),
        update: jest.fn(),
      },
      importRow: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
(prisma as any).working = prisma;
    service = new ResultReportService(prisma);
  });

  it('should return correct result summary counts', async () => {
    const result = await service.getResultSummary('j1');

    expect(result.created).toBe(180);
    expect(result.updated).toBe(12);
    expect(result.skipped).toBe(53);
    expect(result.failed).toBe(5);
    expect(result.totalRows).toBe(250);
  });

  it('should calculate success rate correctly', async () => {
    const result = await service.getResultSummary('j1');
    // (180 + 12) / 250 * 100 = 76.8 → rounded 77
    expect(result.successRate).toBe(77);
  });

  it('should include download URLs', async () => {
    const result = await service.getResultSummary('j1');
    expect(result.reportUrl).toContain('import-report');
    expect(result.failedReportUrl).toContain('import-failed');
  });
});
