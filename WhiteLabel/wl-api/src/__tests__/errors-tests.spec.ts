import { ErrorsService } from '../modules/errors/errors.service';
import { TestsService } from '../modules/tests/tests.service';
import { NotFoundException } from '@nestjs/common';
import { ErrorSeverity } from '@prisma/client';

// ─── Shared mock Prisma ────────────────────────────────────────────────────
const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
  },
  partnerErrorLog: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
  },
  partnerTestLog: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const makeErrorsService = () => new ErrorsService(mockPrisma as any, mockAudit as any);
const makeTestsService = () => new TestsService(mockPrisma as any, mockAudit as any);

// ─── ErrorsService ─────────────────────────────────────────────────────────
describe('ErrorsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('collectErrors() creates error records; CRITICAL severity sets isReportedToMaster=true', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });

    const criticalError = {
      id: 'e1',
      partnerId: 'p1',
      severity: ErrorSeverity.CRITICAL,
      message: 'DB connection failed',
      isReportedToMaster: true,
    };
    mockPrisma.partnerErrorLog.create.mockResolvedValue(criticalError);

    const svc = makeErrorsService();
    const result = await svc.collectErrors('p1', [
      { severity: ErrorSeverity.CRITICAL, message: 'DB connection failed' },
    ]);

    expect(result.collected).toBe(1);
    expect(result.critical).toBe(1);
    expect(mockPrisma.partnerErrorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: 'p1',
          severity: ErrorSeverity.CRITICAL,
          isReportedToMaster: true,
        }),
      }),
    );
    // Audit log called for critical error
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CRITICAL_ERRORS_COLLECTED' }),
    );
  });

  it('resolveError() updates resolvedAt and resolution; throws NotFoundException if error not found', async () => {
    // NotFoundException case
    mockPrisma.partnerErrorLog.findUnique.mockResolvedValueOnce(null);
    const svc = makeErrorsService();
    await expect(svc.resolveError('nonexistent', 'fixed it')).rejects.toThrow(NotFoundException);

    // Successful resolve case
    jest.clearAllMocks();
    const error = { id: 'e1', partnerId: 'p1', severity: ErrorSeverity.HIGH, message: 'Timeout' };
    mockPrisma.partnerErrorLog.findUnique.mockResolvedValue(error);
    const resolved = { ...error, resolvedAt: new Date(), resolvedBy: 'admin', resolution: 'Increased timeout' };
    mockPrisma.partnerErrorLog.update.mockResolvedValue(resolved);

    const result = await svc.resolveError('e1', 'Increased timeout');
    expect(result.resolvedAt).toBeDefined();
    expect(result.resolution).toBe('Increased timeout');
    expect(result.resolvedBy).toBe('admin');
    expect(mockPrisma.partnerErrorLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: expect.objectContaining({ resolvedBy: 'admin', resolution: 'Increased timeout' }),
      }),
    );
  });
});

// ─── TestsService ──────────────────────────────────────────────────────────
describe('TestsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('collectTestResults() saves test log with calculated passRate', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });

    const logEntry = {
      id: 'tl1',
      partnerId: 'p1',
      testType: 'UNIT',
      totalTests: 10,
      passed: 9,
      failed: 1,
      passRate: 90,
    };
    mockPrisma.partnerTestLog.create.mockResolvedValue(logEntry);

    const svc = makeTestsService();
    const result = await svc.collectTestResults('p1', {
      testType: 'UNIT',
      totalTests: 10,
      passed: 9,
      failed: 1,
    });

    expect(result.passRate).toBe(90);
    expect(result.passed).toBe(9);
    expect(result.totalTests).toBe(10);
    expect(mockPrisma.partnerTestLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: 'p1',
          testType: 'UNIT',
          totalTests: 10,
          passed: 9,
          passRate: 90,
        }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TEST_RESULTS_COLLECTED' }),
    );
  });

  it('collectTestResults() calculates pass rate as 90% for 9 passed out of 10 total', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });
    mockPrisma.partnerTestLog.create.mockImplementation(async ({ data }: { data: any }) => ({
      id: 'tl2',
      ...data,
    }));

    const svc = makeTestsService();
    const result = await svc.collectTestResults('p1', {
      testType: 'INTEGRATION',
      totalTests: 10,
      passed: 9,
      failed: 1,
    });

    // passRate is computed as (9/10)*100 = 90 before being stored
    expect(result.passRate).toBe(90);
  });
});
