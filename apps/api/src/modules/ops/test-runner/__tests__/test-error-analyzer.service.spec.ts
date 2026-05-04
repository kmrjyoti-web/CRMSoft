import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  platform: {
    testErrorLog: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      $queryRaw: jest.fn(),
    },
    testResult: {
      findMany: jest.fn(),
    },
    testReport: {
      upsert: jest.fn(),
    },
    testRun: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
};

describe('TestErrorAnalyzerService', () => {
  let service: TestErrorAnalyzerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestErrorAnalyzerService(mockPrisma as any);
    // make $queryRaw available on platform directly
    mockPrisma.platform.$queryRaw = jest.fn().mockResolvedValue([]);
  });

  // ─── categorizeError ───────────────────────────────────────

  describe('categorizeError', () => {
    it('maps P2002 to DATABASE category', () => {
      const result = service.categorizeError('Unique constraint failed — P2002');
      expect(result.category).toBe('DATABASE');
      expect(result.severity).toBe('HIGH');
    });

    it('maps Unauthorized to SECURITY category', () => {
      const result = service.categorizeError('Unauthorized — token missing');
      expect(result.category).toBe('SECURITY');
      expect(result.severity).toBe('HIGH');
    });

    it('maps SQL injection payload to SECURITY with CRITICAL severity', () => {
      const result = service.categorizeError('SQL injection payload reflected in response', { suiteName: 'SQL Injection' });
      expect(result.category).toBe('SECURITY');
    });

    it('maps validation error to VALIDATION category', () => {
      const result = service.categorizeError('Validation failed: field is required');
      expect(result.category).toBe('VALIDATION');
      expect(result.severity).toBe('LOW');
    });

    it('maps circular dependency to ARCHITECTURE category', () => {
      const result = service.categorizeError('Circular dependency detected', { suiteName: 'Circular Dependencies' });
      expect(result.category).toBe('ARCHITECTURE');
    });

    it('marks data loss errors as CRITICAL', () => {
      const result = service.categorizeError('Data loss risk: orphan records found');
      expect(result.severity).toBe('CRITICAL');
    });

    it('marks CRITICAL and HIGH as reportable, LOW/MEDIUM as not', () => {
      const critical = service.categorizeError('Unauthorized bypass found');
      const low = service.categorizeError('Validation failed: optional field');
      expect(critical.isReportable).toBe(true);
      expect(low.isReportable).toBe(false);
    });

    it('maps ECONNREFUSED to CONFIGURATION category', () => {
      const result = service.categorizeError('ECONNREFUSED: connection refused at localhost:5432');
      expect(result.category).toBe('CONFIGURATION');
    });

    it('maps console.log violations to ARCHITECTURE', () => {
      const result = service.categorizeError('console.log found in source', { suiteName: 'Illegal Implementations' });
      expect(result.category).toBe('ARCHITECTURE');
    });
  });

  // ─── persistRunErrors ──────────────────────────────────────

  describe('persistRunErrors', () => {
    it('creates error logs for failed test results', async () => {
      mockPrisma.platform.testResult.findMany.mockResolvedValue([
        { id: 'tr-1', suiteName: 'SQL Injection', testName: 'Payload test', module: 'contacts', filePath: null, errorMessage: 'Unauthorized', errorStack: null },
        { id: 'tr-2', suiteName: 'DB Validation — Foreign Keys', testName: 'FK check', module: 'leads', filePath: null, errorMessage: 'P2002 constraint failed', errorStack: null },
      ]);
      mockPrisma.platform.testErrorLog.createMany.mockResolvedValue({ count: 2 });

      const count = await service.persistRunErrors('run-1');
      expect(count).toBe(2);
      expect(mockPrisma.platform.testErrorLog.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ testRunId: 'run-1', errorCategory: 'SECURITY' }),
          expect.objectContaining({ testRunId: 'run-1', errorCategory: 'DATABASE' }),
        ]),
      });
    });

    it('returns 0 when no failed results', async () => {
      mockPrisma.platform.testResult.findMany.mockResolvedValue([]);
      const count = await service.persistRunErrors('run-empty');
      expect(count).toBe(0);
      expect(mockPrisma.platform.testErrorLog.createMany).not.toHaveBeenCalled();
    });
  });

  // ─── reportToVendor ────────────────────────────────────────

  describe('reportToVendor', () => {
    it('throws NotFoundException when error not found', async () => {
      mockPrisma.platform.testErrorLog.findUnique.mockResolvedValue(null);
      await expect(service.reportToVendor('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws when severity is LOW', async () => {
      mockPrisma.platform.testErrorLog.findUnique.mockResolvedValue({ id: 'e-1', severity: 'LOW' });
      await expect(service.reportToVendor('e-1')).rejects.toThrow(/only HIGH or CRITICAL/i);
    });

    it('marks CRITICAL error as reported', async () => {
      mockPrisma.platform.testErrorLog.findUnique.mockResolvedValue({ id: 'e-2', severity: 'CRITICAL' });
      mockPrisma.platform.testErrorLog.update.mockResolvedValue({});

      await service.reportToVendor('e-2', 'test context');
      expect(mockPrisma.platform.testErrorLog.update).toHaveBeenCalledWith({
        where: { id: 'e-2' },
        data: expect.objectContaining({ reportedToVendor: true, vendorResponse: 'test context' }),
      });
    });

    it('marks HIGH error as reported', async () => {
      mockPrisma.platform.testErrorLog.findUnique.mockResolvedValue({ id: 'e-3', severity: 'HIGH' });
      mockPrisma.platform.testErrorLog.update.mockResolvedValue({});
      await expect(service.reportToVendor('e-3')).resolves.not.toThrow();
    });
  });

  // ─── markResolved ──────────────────────────────────────────

  describe('markResolved', () => {
    it('updates isResolved, resolvedBy, resolvedAt, resolution', async () => {
      mockPrisma.platform.testErrorLog.update.mockResolvedValue({});
      await service.markResolved('e-5', 'user-1', 'Fixed index issue');
      expect(mockPrisma.platform.testErrorLog.update).toHaveBeenCalledWith({
        where: { id: 'e-5' },
        data: expect.objectContaining({ isResolved: true, resolvedBy: 'user-1', resolution: 'Fixed index issue' }),
      });
    });
  });

  // ─── getErrorDashboard ─────────────────────────────────────

  describe('getErrorDashboard', () => {
    beforeEach(() => {
      mockPrisma.platform.testErrorLog.count
        .mockResolvedValueOnce(50)   // total
        .mockResolvedValueOnce(20)   // unresolved
        .mockResolvedValueOnce(5);   // critical
      mockPrisma.platform.testErrorLog.groupBy
        .mockResolvedValueOnce([{ errorCategory: 'DATABASE', _count: { id: 10 } }])   // byCategory
        .mockResolvedValueOnce([{ severity: 'HIGH', _count: { id: 15 } }]);             // bySeverity
      mockPrisma.platform.$queryRaw.mockResolvedValue([{ date: '2026-03-28', count: BigInt(5) }]);
      // getErrorDashboard calls findMany twice:
      //   1st (in Promise.all): resolved logs for MTTR
      //   2nd (after Promise.all): all errors for top10
      mockPrisma.platform.testErrorLog.findMany
        .mockResolvedValueOnce([{ createdAt: new Date('2026-03-27'), resolvedAt: new Date('2026-03-28') }])
        .mockResolvedValue([{ message: 'P2002 constraint', errorCategory: 'DATABASE' }]);
    });

    it('returns total, unresolved, critical counts', async () => {
      const result = await service.getErrorDashboard('t-1', 30);
      expect(result.total).toBe(50);
      expect(result.unresolved).toBe(20);
      expect(result.critical).toBe(5);
    });

    it('calculates resolution rate correctly', async () => {
      const result = await service.getErrorDashboard('t-1', 30);
      // (50-20)/50 = 60%
      expect(result.resolutionRate).toBe(60);
    });

    it('returns byCategory and bySeverity maps', async () => {
      const result = await service.getErrorDashboard('t-1', 30);
      expect(result.byCategory).toMatchObject({ DATABASE: 10 });
      expect(result.bySeverity).toMatchObject({ HIGH: 15 });
    });

    it('returns period structure with from/to dates', async () => {
      const result = await service.getErrorDashboard('t-1', 7);
      expect(result.period.days).toBe(7);
      expect(result.period.from).toBeInstanceOf(Date);
    });
  });

  // ─── generateReport ────────────────────────────────────────

  describe('generateReport', () => {
    it('throws NotFoundException when run not found', async () => {
      mockPrisma.platform.testRun.findUnique.mockResolvedValue(null);
      await expect(service.generateReport('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('upserts TestReport with summary, categoryResults, errorSummary', async () => {
      mockPrisma.platform.testRun.findUnique.mockResolvedValue({
        id: 'run-1', status: 'COMPLETED',
        totalTests: 10, passed: 8, failed: 2, duration: 5000, summary: {},
        results: [
          { testType: 'SMOKE', module: 'leads', status: 'PASS' },
          { testType: 'SMOKE', module: 'leads', status: 'FAIL' },
        ],
        errorLogs: [{ severity: 'CRITICAL', isReportable: true }, { severity: 'HIGH', isReportable: true }],
      });
      mockPrisma.platform.testReport.upsert.mockResolvedValue({ id: 'report-1' });

      await service.generateReport('run-1');
      expect(mockPrisma.platform.testReport.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { testRunId: 'run-1' },
          create: expect.objectContaining({
            summary: expect.objectContaining({ passRate: 80 }),
            errorSummary: expect.objectContaining({ critical: 1 }),
          }),
        }),
      );
    });
  });
});
